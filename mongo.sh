mongod --replSet msrs --port 27017 --dbpath ~/db/rs1/ --fork --logpath ~/log/rs1.log
mongod --replSet msrs --port 27016 --dbpath ~/db/rs2/ --fork --logpath ~/log/rs2.log
mongod --replSet msrs --port 27015 --dbpath ~/db/rs3/ --fork --logpath ~/log/rs3.log
