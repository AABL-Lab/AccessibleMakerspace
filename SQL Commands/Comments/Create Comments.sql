DROP TABLE IF EXISTS comments;

CREATE TABLE comments(
	commentID bigserial PRIMARY KEY,
	userID Int NOT NULL,
	projID Int NOT NULL,
	content text,
	ParentID int default 0
);

INSERT INTO comments (userID, projID, content)
VALUES(1234, 1234, 'I like Chicken and Rice');

select * from comments;