create table if not exists accounts(
user_id int not null primary key auto_increment,
user_name varchar(255),
user_lastName varchar(255),
email varchar(255),
user_pass varchar(255)
);

alter table accounts add token varchar(255);