const mysql = require('mysql');
const inquirer = require('inquirer');
const Table = require('cli-table');

const DATABASE = 'bamazon';
const connection = mysql.createConnection({
	host: 'localhost',
	port: 3306,
	user: 'basicUser',
	password: 'password',
	database: DATABASE,
});

const userRoles = ['Customer','Manager','Supervisor'];
var shoppingList = [];

const chooseRole = () => {
	inquirer.prompt([{
		type: 'list',
		name: 'role',
		message: 'Please choose a role',
		choices: userRoles
	}]).then( response => {
		switch (response.role){
			case "Customer":
				console.log("I'm a customer");
				showInventory();
				//goShopping();
				break;
			case "Manager":
				console.log("I'm a manager");
				break;
			case "Supervisor":
				console.log("I'm a supervisor");
				break;
			default:
				console.log(`${response.role} is unknown`);
		}
	}).catch( error => {
		console.log(error);
	})
}

const showInventory = () =>{
	let table = new Table({
		head: ['ID','Product','Department','Price ($)','Qty In Stock'],
		colWidths: [10,20,20,20,20]
	});
	connection.connect( error => {
		if(error){
			console.log(error);
		}

		connection.query(`SELECT * FROM products`, (error,data) => {
			if (error){
				console.log(error);
			}

			//console.log(data);

			data.forEach( entry => {
					table.push([
						entry.item_id,entry.product_name,entry.department_name,entry.price,entry.stock_quantity
					]);
					shoppingList.push(
						entry.item_id
					);
				});
				
			//console.log(data[0].item_id)
			console.log(shoppingList);
			console.log(table.toString());

		}).then( () => {
			goShopping();
		}).catch( error =>{
			console.log(error);
		})
	})
}

const goShopping = () => {
	/*inquirer.prompt([{
		type: 'list',
		name: 'itemSelect',
		message: 'Select an item by its id',
		choices: shoppingList
	}]).then( response => {
		console.log(response);
	}).catch( error => {
		console.log(error);
	})*/

	console.log(shoppingList);
}


chooseRole();