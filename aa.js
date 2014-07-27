var rs1 = '--replSet msrs --port 27017 --dbpath ~/db/rs1/ --fork --logpath ~/log/rs1.log';
var rs2 = '--replSet msrs --port 27016 --dbpath ~/db/rs2/ --fork --logpath ~/log/rs2.log';
var rs3 = '--replSet msrs --port 27015 --dbpath ~/db/rs3/ --fork --logpath ~/log/rs3.log';

'mongo localhost:27017';

config = {_id: 'msrs', members: [{_id: 0, host: 'localhost:27017'}, {_id: 1, host: 'localhost:27016'}, {_id: 2, host: 'localhost:27015'}]};
rs.initiate(config);
rs.status();
'use admin;';
