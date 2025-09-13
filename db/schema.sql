CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','employee') NOT NULL,
  pin_code VARCHAR(20) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, password, role)
VALUES
('admin', '$2a$10$w9XddHyKObOT8sB/F7J/Mej/En7KmXJo7iIdnHTHqkWNYF1uL90nq', 'admin');
