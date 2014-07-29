cd ../sys
MONGO_OPLOG_URL="mongodb://oplogger:PASSWORD@localhost:27017/local?authSource=admin" MONGO_URL="mongodb://localhost:27017/website" meteor run --release 0.8.3-rc6
