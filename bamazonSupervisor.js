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
		}, 1000 * .5);
	});
}

const supervisor_choices = () => {
	inquirer.prompt([{
		type: 'list',
		name: 'choice',
		message: 'What action would you like to take',
		choices: ['View Product Sales by Department','Create New Department', 'Exit']
	}]).then( response => {
		switch (response.choice){
			case 'View Product Sales by Department':
				view_sales();
				break;
			case 'Create New Department':
				create_department();
				break;
			case 'Exit':
				exit();
				break;
			default:
				console.log(`${response.choice} is not a known option`);
		}
	})
}

const view_sales = () => {
	clear();
	let table = new Table({
		head: ['Department ID','Department Name','Over Head Costs','Product Sales','Total Profit'],
		colWidths: [20,20,20,20,20]
	});

	connection.query(`SELECT d.department_id,d.department_name,SUM(d.over_head_costs) AS over_head_costs,SUM(p.product_sales) AS product_sales FROM departments AS d INNER JOIN products AS p ON d.department_name=p.department_name GROUP BY d.department_id,d.department_name`, (error,data) => {
		if(error){
			console.log(error);
		}
		data.forEach( entry => {
			var profit = entry.product_sales - entry.over_head_costs;
			table.push([entry.department_id,entry.department_name,entry.over_head_costs,entry.product_sales, profit]);
		})

		console.log(table.toString());
		supervisor_choices();
	})
}

const create_department = async () => {
	clear();
	let table = new Table({
		head: ['Department ID','Department Name'],
		colWidths: [20,20]
	});
	let existing_ids = [];
	connection.query('SELECT department_id,department_name from departments', (error,data) => {
		if (error) {
			console.log(error);
		}

		data.forEach( entry => {
			existing_ids.push(entry.department_id);
		})

		data.forEach( entry=> {
			table.push([entry.department_id,entry.department_name]);
		})
		console.log(table.toString());
		
	})
	await forcePromise();
	
	inquirer.prompt([{
		type: 'input',
		name: 'id',
		message: 'Set an unused ID for the new department',
		validate: (str) => {
			strConverted = parseInt(str);
			if ((validator.isNumeric(str) && strConverted > 0) && !existing_ids.includes(strConverted)){
				return true;
			} else if (strConverted === 0){
				console.log("\nDepartment ID cannot be Zero (0)\n");
				return false;
			} else if (existing_ids.includes(strConverted)) {
				console.log("\nThis ID is already in use.\n");
				return false;
			} else {
				console.log("\nPlease enter only positive numbers\n");
				return false;
			}
		}
	},
	{
		type: 'input',
		name: 'name',
		message: 'What is the name of the department?',
		validate: (str) => {
			if (str.length > 3) {
				return true;
			} else {
				console.log("\nDepartment names need to be at least 4 characters long.\n");
				return false;
			}
		}
	},
	{
		type: 'input',
		name: 'overhead',
		message: 'What is the overhead cost for this department?',
		validate: (str) => {
			if (validator.isNumeric(str) && parseInt(str) > 0){
				return true
			} else {
				console.log("\nPlease enter only positive numbers, no $ sign needed\n");
				return false;
			}
		}
	}]).then( response => {

		connection.query('INSERT INTO departments VALUES(?,?,?)',[response.id,response.name,response.overhead], (error,data) => {
		})
		supervisor_choices();
	})
}

const exit = () => {
	connection.end();
}


supervisor_choices();
