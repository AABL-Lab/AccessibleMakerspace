DROP TABLE IF EXISTS users;

CREATE TABLE users(
	userID bigSERIAL PRIMARY KEY,
	username varchar(100) NOT NULL UNIQUE,
	password varchar(255) NOT NULL,
	email varchar(100) NOT NULL,
	admin varchar(1) DEFAULT 'n',
	displayname varchar(100),
	bio TEXT
);

INSERT INTO USERS (username, password, displayname, bio) 
VALUES('jlawton', 'password', 'Jake Lawton', 'I am a CS Student at Tufts University');

select * from users;