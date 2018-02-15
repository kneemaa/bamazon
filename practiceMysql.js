const mysql = require('mysql');

const DATABASE = 'playlistDB';
const connection = mysql.createConnection({
	host: 'localhost',
	port: 3306,
	user: 'basicUser',
	password: 'password',
	database: DATABASE,
});

connection.connect(function(error) {
	if (error){
		console.log(error);
	}
/*
	console.log(`Connect as id ${connection.threadId}`);
	connection.query(`select * from songs`,function(error, data){
		if (error){
			console.log(error);
		}

		for(i=0; i< data.length;i++){
			console.log(`| ${data[i].artist} | ${data[i].title} | ${data[i].genre} |`);
		}
	})

	connection.query(`select * from songs WHERE genre=?`, ['Classic Rock'], function(error, data){
		if (error) {
			console.log(error);
		}
		console.log(`\n\n`);
		for(i=0; i< data.length;i++){
			console.log(`| ${data[i].artist} | ${data[i].title} | ${data[i].genre} |`);
		}
		//console.log(data);
	});*/

	connection.query(`INSERT INTO songs SET ?`,{
		artist: "Queen",
		title: "Bohemian Raphsody",
		genre: "Rock"
	}, function(error, data){
		if(error){
			console.log(error);
		}

		console.log(data);
	})

	connection.query(`DELETE FROM songs WHERE ?`,['id<9'], function (error, data){
		if (error){
			console.log(error);
		}

		console.log(data);
	})
});