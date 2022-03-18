set -e

aws s3 cp ./build/index.html s3://www.chrisjuchem.dev/diplomacy-chess
aws cloudfront create-invalidation --distribution-id E1SB35Z0FSXGIF \
    --paths "/diplomacy-chess"
