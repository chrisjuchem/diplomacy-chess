set -e

. aws_secrets.sh

aws s3 cp ./build/index.html s3://www.chrisjuchem.dev/diplomacy-chess

aws s3 rm s3://www.chrisjuchem.dev/diplomacy-chess/ --recursive
aws s3 cp build/diplomacy-chess s3://www.chrisjuchem.dev/diplomacy-chess/ --recursive

aws cloudfront create-invalidation --distribution-id E1SB35Z0FSXGIF \
    --paths "/diplomacy-chess*"
