DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon;
USE bamazon;
CREATE TABLE products(
	item_id INT NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(30),
    department_name VARCHAR(30),
    price INT(100),
    stock_quantity INT(10),
    primary key (item_id)
);
		

INSERT INTO products VALUES (item_id, 'PS4', 'Electronics',400,10);
INSERT INTO products VALUES (item_id, 'Pixel 2', 'Expensive Shit', 800,40);
INSERT INTO products VALUES (item_id, 'iPhone X', 'Expensive Shit', 1000, 40);
INSERT INTO products VALUES (item_id, 'Coke Zero', 'Groceries', 2, 50);
INSERT INTO products VALUES (item_id, 'Deodorant', 'Pharmacy', 10, 15);
INSERT INTO products VALUES (item_id, 'Levi Jeans', 'Clothing', 30,1);
INSERT INTO products VALUES (item_id, 'White T Shirt', 'Clothing', 30,20);
INSERT INTO products VALUES (item_id, 'XBOX 1', 'Electronics', 300, 2);