# Image Resize

AWS Lambda & S3와 Serverless Framework 를 이용한 이미지 리사이징

# Summary

이 함수는 너비와 높이를 쿼리 파라미터로 받아 S3 내부의 이미지의 사이즈를 조절하고, 최종적으로는 `image/webp` 형식으로 반환하는 함수입니다.

`https://some.cloudfront.net/pathToObject/image.png?w=32&h=32`

위와 같이 요청하게 되면 `image/png` 형식의 이미지를 가로, 세로 해상도를 조절해 `image/webp` 로 반환하게 됩니다.

( 단,GIF 는 원본을 반환하도록 되어있습니다. )

# Usage

## Setup

`serverless framework` 를 사용하기 위해서 설치가 필요합니다.

```sh
$ npm install -g serverless
```

신규 프로젝트를 시작하려면 아래와 같이 시작할 수 있습니다.

```sh
# Create a new serverless project
$ serverless

# Move into the newly created directory
$ cd your-service-name
```

## Deploy

배포하기 위해선 아래와 같은 `serverless.yml` 파일이 `rootDir`에 존재 해야합니다.

```yml
service: matchgg-image-resize
frameworkVersion: "3"
plugins:
  - serverless-lambda-edge-pre-existing-cloudfront

pacakge:

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  iam:
    role:
      [arn:aws:iam::...]
      # AWSLambdaExecute 권한을 가진 IAM

functions:
  imageResize:
    name:
      [labmda_function_name]
      # 람다 함수 이름 지정
    handler: index.imageResize
    events:
      - preExistingCloudFront:
          distributionId:
            [cloudfront_distributioin_id]
            # CloudFront 배포 아이디
          eventType: origin-response
          pathPattern: "*"
          includeBody: false
```

아래와 같이 해당 이미지 리사이징 함수를 AWS 내부의 Lambda에 배포할 수 있습니다.

```sh
$ npm run deploy
```

## Local

로컬에서 테스트할 수 있도록 `index-local.js`를 통해 이미지 파일을 `rootDir`에 생성하도록 되어있습니다.

아래와 같이 실행할 수 있습니다.

```sh
$ npm run dev
```

실행 결과 `rootDir` 내 `output.webp` 를 확인할 수 있습니다.
