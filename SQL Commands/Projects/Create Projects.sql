DROP TABLE IF EXISTS projects;

CREATE TABLE projects(
	projID bigserial PRIMARY KEY,
	userID int NOT NULL,
	videoURL varchar(255),
	aslURL varchar(255),
	title varchar(255),
	description TEXT,
	supplies TEXT,
	skills TEXT,
	tags TEXT,
	created date
);

Insert into projects (userid, videourl, aslurl, title, description, supplies, skills, tags, created)
values (1, 'https://youtu.be/GcgxgJOjPUI?si=yhogjCAsJiVYDbRe', 'https://youtu.be/NMOZmSH1qWQ?si=WW0M3wAx6nHJbrcd', 'Fun With Friends', 'I like cheese, yess I do!!!','Camera, Tape, Rope', 'Coding, English, Robotics', 'Beginner, Fun, Quirky', '2024-02-13');

select * from projects;