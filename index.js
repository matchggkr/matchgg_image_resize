"use strict";

import Sharp from "sharp";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const S3 = new S3Client({
  region: "ap-northeast-2",
});

const getQuerystring = (querystring, key) => {
  return new URLSearchParams("?" + querystring).get(key);
};

export const imageResize = async (event) => {
  // get the request and response from the event
  const { request, response } = event.Records[0].cf;

  // get querystring
  const querystring = request.querystring;

  // get the uri of the request
  const uri = decodeURIComponent(request.uri);

  // get the extension of the uri
  const extension = uri.match(/(.*)\.(.*)/)[2].toLowerCase();

  // if the extension is not gif, return the response as is
  if (extension === "gif") return response;

  // parse the querystring
  const width = Number(getQuerystring(querystring, "w")) || null;
  const height = Number(getQuerystring(querystring, "h")) || null;

  // fetch s3 data
  const s3BucketDomainName = request.origin.s3.domainName;
  let s3BucketName = s3BucketDomainName.replace(
    ".s3.ap-northeast-2.amazonaws.com",
    ""
  );
  s3BucketName = s3BucketName.replace(".s3.amazonaws.com", "");
  const s3Path = uri.substring(1);

  // fetch image from s3
  let s3Object = null;
  try {
    s3Object = await S3.send(
      new GetObjectCommand({
        Bucket: s3BucketName,
        Key: s3Path,
      })
    );
  } catch (err) {
    console.log(" >> [FAIL] S3 GetObject\n" + err);

    return err;
  }

  // image resizing
  const s3Uint8ArrayData = await s3Object.Body.transformToByteArray();

  let resizedImage = null;
  try {
    resizedImage = await Sharp(s3Uint8ArrayData)
      .resize({
        width: width,
        height: height,
        fit: "contain",
      })
      .toFormat("webp", {
        quality: 100,
      })
      .toBuffer();
  } catch (err) {
    console.log(" >> [FAIL] Sharp Resize\n" + err);
    return err;
  }

  // get the resized image byte length
  const resizedImageByteLength = Buffer.byteLength(resizedImage, "base64");

  // if the resized image is larger than 1MB, return the response as is
  if (resizedImageByteLength >= 1048576) return response;

  // set the response headers -> content-type as image/webp
  response.headers["content-type"] = [
    { key: "Content-Type", value: "image/webp" },
  ];

  // set the response status
  response.status = 200;
  response.body = resizedImage.toString("base64");
  response.bodyEncoding = "base64";

  return response;
};
