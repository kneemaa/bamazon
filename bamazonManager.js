const mysql = require('mysql');
const inquirer = require('inquirer');
const Table = require('cli-table');
const validator = require('validator');
const clear = require('clear');

const DATABASE = 'bamazon';
const connection = mysql.createConnection({
	host: 'localhost',
	port: 3306,
	user: 'basicUser',
	password: 'password',
	database: DATABASE,
});

connection.connect( error => {
	if(error){
		console.log(error);
	}
});

const forcePromise = (x) => {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve(x);
		}, 2000);
	});
}

const managerChoices = [
	'View Products for Sale',
	'View Low Inventory',
	'Add to Inventory',
	'Add New Product',
	'Don\'t call me Mr. Manager, It\'s just Manager (Exit Application)'];

const options = () => {
	inquirer.prompt([{
		type: 'list',
		name: 'options',
		message: 'Hello Mr. Manager, what would you like to do?',
		choices: managerChoices
	}]).then( response => {
		switch (response.options){
			case managerChoices[0]:
				showInventory();
				break;
			case managerChoices[1]:
				lowInventory();
				break;
			case managerChoices[2]:
				addToInventory();
				break;
			case managerChoices[3]:
				console.log(response.options);
				break;
			case managerChoices[4]:
				console.log(`\n${response.options}\n`);
				connection.end();
				break; 
			default:
				console.log(`${response.options} is not valid`);
				options();
				break;
		}
	})
}

const showInventory = () =>{
	clear();
	let table = new Table({
		head: ['ID','Product','Department','Price ($)','Qty In Stock'],
		colWidths: [10,20,20,20,20]
	});

	connection.query(`SELECT * FROM products`, (error,data) => {
		if (error){
			console.log(error);
		}

		data.forEach( entry => {
			table.push([
				entry.item_id,entry.product_name,entry.department_name,entry.price,entry.stock_quantity
			]);
		});

		console.log(table.toString());
		options();
	})
}

const lowInventory = () => {
	clear();
	let table = new Table({
		head: ['ID','Product','Department','Price ($)','Qty In Stock'],
		colWidths: [10,20,20,20,20]
	});

	connection.query(`SELECT * FROM products WHERE stock_quantity < 5`, (error,data) => {
		if(error){
			console.log(error);
		}
		data.forEach( entry => {
			table.push([
				entry.item_id,entry.product_name,entry.department_name,entry.price,entry.stock_quantity
			]);
		});
		console.log(table.toString());
		options();
	})
}


const addToInventory = async () => {
	clear();
	let table = new Table({
		head: ['ID','Product','Department','Price ($)','Qty In Stock'],
		colWidths: [10,20,20,20,20]
	});
	var idList = [];
	await connection.query(`SELECT * FROM products`, (error,data) => {
		if (error){
			console.log(error);
		}

		data.forEach( entry => {
			table.push([
				entry.item_id,entry.product_name,entry.department_name,entry.price,entry.stock_quantity
			]);
			idList.push(entry.item_id.toString())
		});
		console.log(table.toString());
		console.log(idList);
	})
	await forcePromise();
	
	inquirer.prompt([{
		type: 'list',
		name: 'id',
		message: 'Which item do you want to update',
		choices: idList
	},
	{
		type: 'input',
		name: 'qty',
		message: 'What quantity do you want to update to?',
		validate: (str) => {
			if (validator.isNumeric(str) && parseInt(str) > 0){
				return true
			} else if (parseInt(str) === 0){
				console.log("\nNo such thing as purchasing Zero Items, try again.\n");
				return false;
			} else {
				console.log("\nPlease enter only positive numbers\n");
				return false;
			}
		}
	}]).then( response => {
		connection.query(`UPDATE products SET stock_quantity=? WHERE item_id=?`,[response.qty,response.id],(error,data) => {
			if(error){
				console.log(error);
			}
		})
		options();
	})
}

options();