const mysql = require('mysql');
const inquirer = require('inquirer');
const Table = require('cli-table');
const validator = require('validator');

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
						entry.item_id.toString());
				});
				
			//connection.end();

			console.log(table.toString());
			goShopping(shoppingList);
		})

})}

const goShopping = (list) => {
	console.log(list);
	inquirer.prompt([{
		type: 'list',
		name: 'itemSelect',
		message: 'Select an item to purchase by its ID',
		choices: list
	},
	{
		type: 'input',
		name: 'quantityPurchased',
		message: 'How many of this item would you like to buy?',
		validate: (str) => {
			if (validator.isNumeric(str)){
				return true
			} else {
				console.log("\nPlease enter only numbers\n");
				return false;
			}
		}
	}]).then( response => {
		cartCheckout(response.itemSelect.toString(),response.quantityPurchased.toString());
	}).catch( error => {
		console.log(error);
	})
}

const cartCheckout = (id,qty) => {
	let cart = new Table({
		head: ['ID','Product','Department','Price ($)','Qty In Stock'],
		colWidths: [10,20,20,20,20]
	});

	connection.query(`SELECT * FROM products WHERE item_id=? AND stock_quantity>=?`,[id,qty],(error,data) => {
		if(error){
			console.log(error);
		}
		
		if(data.length > 0){
			data.forEach( entry => {
				cart.push([
					entry.item_id,entry.product_name,entry.department_name,entry.price,entry.stock_quantity
				]);
			})
			//console.log(cart.toString());
			
			checkout(id,data[0].stock_quantity,parseInt(qty));
		} else {
			console.log(`\nThere's not enough in stock. Please change your quantity.\n`);
			goShopping(shoppingList);
		}
	})
}

const checkout = (id,currentQty,purchaseQty) => {
	let newQty = currentQty - purchaseQty;

	connection.query(`UPDATE products SET stock_quantity=? WHERE item_id=?`,[newQty,id],(error,data) => {
		if(error){
			console.log(error);
		}
		console.log("\nCongrats on your purchase!\n");
		restartFlow();
	})
}

const restartFlow = () => {
	inquirer.prompt([{
		type: 'list',
		name: 'action',
		message: 'What would you like to do?',
		choices: ['Continue Shopping','Change My Role','Exit']
	}]).then( response => {
		switch (response.action){
			case 'Continue Shopping':
				//
				break;
			case 'Change My Role':
				//
				break;
			case 'Exit':
				connection.end();
				break;
			default:
				console.log(`${response.action} is unknown.`);
		}
	})
}

chooseRole();