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
var shoppingList = [];

connection.connect( error => {
	if(error){
		console.log(error);
	}
});


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
					shoppingList.push(
						entry.item_id.toString());
				});
				

			console.log(table.toString());
			goShopping(shoppingList);
		})

}

const goShopping = (list) => {
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
			
			checkout(id,data[0].stock_quantity,parseInt(qty),data[0].price);
		} else {
			console.log(`\nInsufficient quantity! Please change your quantity.\n`);
			goShopping(shoppingList);
		}
	})
}

const checkout = (id,currentQty,purchaseQty,price) => {
	let newQty = currentQty - purchaseQty;
	let total = purchaseQty * price;
	connection.query(`UPDATE products SET stock_quantity=? AND product_sales=? WHERE item_id=?`,[newQty,total,id],(error,data) => {
		if(error){
			console.log(error);
		}
		console.log(`\nCongrats on your purchase! Your total is $${total}\n`);
		restartFlow();
	})
}

const restartFlow = () => {
	inquirer.prompt([{
		type: 'list',
		name: 'action',
		message: 'What would you like to do?',
		choices: ['Continue Shopping','Exit']
	}]).then( response => {
		switch (response.action){
			case 'Continue Shopping':
				showInventory();
				break;
			case 'Exit':
				connection.end();
				break;
			default:
				console.log(`${response.action} is unknown.`);
		}
	})
}

showInventory();