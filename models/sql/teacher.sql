USE eswil_db;


CREATE TABLE teachers (
  teacher_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  subject VARCHAR(100),
  classes JSON, 
  salary DECIMAL(10, 2),
  role VARCHAR(50) 
);
