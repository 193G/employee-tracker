const inquirer = require("inquirer");
const connection = require("./db/connection.js");
require("console.table");

const mainMenu = () => {
  console.log(`Employee Tracker`);
  inquirer
    .prompt({
      name: "start",
      type: "list",
      message: "What would you like to do",
      choices: [
        "View All Employees", 
        "View All Employees By Department", 
        "View All Employees By Manager", 
        "Add Employee", 
        "Remove Employee", 
        "Update Employee Role", 
        "Update Employee Manager", 
        "View All Roles", 
        "Add Role", 
        "Remove Role", 
        "View All Departments", 
        "Add Department", 
        "Remove Department", 
        "View Total Utilized Budget of a Department", 
        "Exit", 
      ],
    })
    .then((answer) => {
      switch (answer.start) {
        case "View All Employees":
          ViewAllEmployees();
          break;

        case "View All Employees By Department":
          ViewAllEmployeesByDepartment();
          break;

        case "View All Employees By Manager":
          ViewAllEmployeesByManager();
          break;

        case "Add Employee":
          AddEmployee();
          break;

        case "Remove Employee":
          RemoveEmployee();
          break;

        case "Update Employee Role":
          UpdateEmployeeRole();
          break;

        case "Update Employee Manager":
          UpdateEmployeeManager();
          break;

        case "View All Roles":
          ViewAllRoles();
          break;

        case "Add Role":
          AddRole();
          break;

        case "Remove Role":
          RemoveRole();
          break;

        case "View All Departments":
          ViewAllDepartments();
          break;

        case "Add Department":
          AddDepartment();
          break;

        case "Remove Department":
          RemoveDepartment();
          break;

        case "View Total Utilized Budget of a Department":
          ViewTotalUtilizedBudgetByDepartment();
          break;

        case "Exit":
          Exit();
          break;
      }
    });
};

function ViewAllEmployees() {
  const query = `SELECT 
  employee.id, 
  employee.first_name, 
  employee.last_name, 
  role.title, 
  department.name AS 
  department, 
  role.salary, 
  CONCAT(manager.first_name, ' ', manager.last_name) AS 
  manager FROM 
  employee 
  LEFT JOIN role ON 
  employee.role_id = role.id 
  LEFT JOIN department ON 
  role.department_id = department.id 
  LEFT JOIN employee manager ON 
  manager.id = employee.manager_id;`;
  connection.query(query, (err, data) => {
    if (err) throw err;
    console.table(data);
    mainMenu();
  });
}

function ViewAllEmployeesByDepartment() {
  inquirer
    .prompt({
      name: "department",
      type: "list",
      message: "Which department would you like to view?",
      choices: [
        "Marketing",
        "Accounting",
        "Engineering",
        "Human Resources",
        "Legal",
      ],
    })
    .then((answer) => {
      switch (answer.department) {
        case "Marketing":
          return myViewEmployeesByDepartment("Marketing");
        case "Accounting":
          return myViewEmployeesByDepartment("Accounting");
        case "Engineering":
          return myViewEmployeesByDepartment("Engineering");
        case "Human Resources":
          return myViewEmployeesByDepartment("Human Resources");
        case "Legal":
          return myViewEmployeesByDepartment("Legal");
      }
    });
  function myViewEmployeesByDepartment(department) {
    const query = `
     SELECT employee.id, 
     employee.first_name, 
     employee.last_name, 
     role.title, 
     department.name AS department 
     FROM employee 
     LEFT JOIN role ON employee.role_id = role.id 
     LEFT JOIN department ON role.department_id = department.id 
     WHERE department.name = ?;`;
    connection.query(query, department, (err, data) => {
      if (err) throw err;
      console.table(data);
      mainMenu();
    });
  }
}

function ViewAllEmployeesByManager() {
  const query = `SELECT 
   employee.id, 
   employee.first_name, 
   employee.last_name, 
   role.title, 
   department.name AS 
   department, 
   CONCAT(manager.first_name, ' ', manager.last_name) AS manager 
   FROM employee 
   LEFT JOIN role ON employee.role_id = role.id 
   LEFT JOIN department ON role.department_id = department.id 
   LEFT JOIN employee manager ON manager.id = employee.manager_id 
   ORDER BY manager;`;
  connection.query(query, (err, data) => {
    if (err) throw err;
    console.table(data);
    mainMenu();
  });
}

function AddEmployee() {
  let userInput1;
  const query = `SELECT id, title FROM role WHERE title NOT LIKE '%Manager%';`;

  Promise.resolve()
    .then(() => {
      return new Promise((resolve, reject) => {
        connection.query(query, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });
    })
    .then((rolesData) => {
      const roles = rolesData.map(
        (item) => `Role title: ${item.title}, Role ID: ${item.id}`
      );

      return inquirer.prompt([
        {
          name: "first_name",
          type: "input",
          message: "What is the employee's first name?",
        },
        {
          name: "last_name",
          type: "input",
          message: "What is the employee's last name?",
        },
        {
          name: "role",
          type: "list",
          message: "What is the employee's role id?",
          choices: roles,
        },
      ]);
    })
    .then((answer) => {
      userInput1 = answer;
      const query2 = `SELECT 
      manager.id as manager_id,
      CONCAT(manager.first_name, ' ', manager.last_name) AS manager_name
      FROM employee
      LEFT JOIN role ON employee.role_id = role.id
      LEFT JOIN employee AS manager ON manager.id = employee.manager_id 
      WHERE manager.id IS NOT NULL
      GROUP BY manager_id;`;
      return new Promise((resolve, reject) => {
        connection.query(query2, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });
    })
    .then((managersData) => {
      const managers = managersData.map(
        (item) => `${item.manager_name} ID:${item.manager_id}`
      );

      return inquirer.prompt([
        {
          name: "manager",
          type: "list",
          message: "Which manager is the employee under?",
          choices: [...managers, "None"],
        },
      ]);
    })
    .then((answer) => {
      const query = `INSERT INTO employee 
      (first_name, last_name, role_id, manager_id) 
      VALUES (?, ?, ?, ?)`;
      connection.query(
        query,
        [
          userInput1.first_name,
          userInput1.last_name,
          userInput1.role.split("ID: ")[1],
          answer.manager.split("ID:")[1],
        ],
        (err, data) => {
          if (err) throw err;
          console.log(
            `Added ${userInput1.first_name} ${userInput1.last_name} to the database`
          );
          ViewAllEmployees();
        }
      );
    });
}

function RemoveEmployee() {
  const query = `SELECT 
  employee.id, 
  employee.first_name, 
  employee.last_name, 
  role.title, 
  department.name AS 
  department, 
  role.salary, 
  CONCAT(manager.first_name, ' ', manager.last_name) AS 
  manager FROM 
  employee LEFT JOIN role ON 
  employee.role_id = role.id 
  LEFT JOIN department ON 
  role.department_id = department.id LEFT JOIN 
  employee manager ON 
  manager.id = employee.manager_id;`;
  connection.query(query, (err, data) => {
    if (err) throw err;
    const employees = data.map(
      (item) => `${item.first_name} ${item.last_name}`
    );
    inquirer
      .prompt({
        name: "employee",
        type: "list",
        message: "Which employee would you like to remove?",
        choices: [...employees],
      })
      .then((answer) => {
        const query = `DELETE FROM employee WHERE first_name = ? AND last_name = ?`;
        connection.query(
          query,
          [answer.employee.split(" ")[0], answer.employee.split(" ")[1]],
          (err, data) => {
            if (err) throw err;
            console.log(
              `You have removed ${answer.employee} from the database.`
            );
            ViewAllEmployees();
          }
        );
      });
  });
}

function UpdateEmployeeRole() {
  const query = `SELECT first_name, last_name FROM employee;`;
  connection.query(query, (err, data) => {
    const employees = data.map(
      (item) => `${item.first_name} ${item.last_name}`
    );
    inquirer
      .prompt([
        {
          name: "employee",
          type: "list",
          message: "Which employee would you like to update?",
          choices: employees,
        },
      ])
      .then((answer) => {
        const selectedEmployee = answer.employee.split(" ");
        const firstName = selectedEmployee[0];
        const lastName = selectedEmployee[1];
        const query = `SELECT title FROM role;`;
        connection.query(query, (err, data) => {
          const roles = data.map((item) => item.title);
          inquirer
            .prompt({
              name: "role",
              type: "list",
              message: "What is the employee's new role?",
              choices: roles,
            })
            .then((answer) => {
              const query = `SELECT id FROM role WHERE title = ?`;
              connection.query(query, [answer.role], (err, data) => {
                if (err) throw err;
                const roleId = data[0].id;
                const query = `UPDATE employee SET role_id = ? WHERE first_name = ? AND last_name = ?`;
                connection.query(
                  query,
                  [roleId, firstName, lastName],
                  (err, data) => {
                    if (err) throw err;
                    console.log(
                      `Successfully updated ${firstName} ${lastName}'s role to ${answer.role}.`
                    );
                    ViewAllEmployees();
                  }
                );
              });
            });
        });
      });
  });
}

function UpdateEmployeeManager() {
  const query = `SELECT first_name, last_name FROM employee;`;
  connection.query(query, (err, data) => {
  const employees = data.map(
    (item) => `${item.first_name} ${item.last_name}`
  );
  inquirer
    .prompt([
      {
        name: "employee",
        type: "list",
        message: "Which employee would you like to update?",
        choices: employees,
      },
    ])
    .then((answer) => {
      const selectedEmployee = answer.employee.split(" ");
      const firstName = selectedEmployee[0];
      const lastName = selectedEmployee[1];
      const query = `SELECT 
      first_name, last_name 
      FROM employee 
      WHERE manager_id IS NULL 
      AND first_name != '${firstName}' 
      AND last_name != '${lastName}';`;
      connection.query(query, (err, data) => {
        const managers = data.map(
          (item) => `${item.first_name} ${item.last_name}`
        );
        inquirer
          .prompt({
            name: "manager",
            type: "list",
            message: "Who is the employee's new manager?",
            choices: managers,
          })
          .then((answer) => {
            const query = `SELECT id FROM employee WHERE first_name = ? AND last_name = ?`;
            connection.query(query, [answer.manager.split(" ")[0], answer.manager.split(" ")[1]], (err, data) => {
              if (err) throw err;
              const managerId = data[0].id;
              const query = `UPDATE employee SET manager_id = ? WHERE first_name = ? AND last_name = ?`;
              connection.query(
                query,
                [managerId, firstName, lastName],
                (err, data) => {
                  if (err) throw err;
                  console.log(
                    `Successfully updated ${firstName} ${lastName}'s manager to ${answer.manager}.`
                  );
                  ViewAllEmployees();
                }
              );
            });
          });
      }
    );
  });
});
}
function ViewAllRoles() {
  const query = `SELECT 
   role.id, 
   role.title, 
   role.salary, 
   department.name AS department 
   FROM role 
   LEFT JOIN department ON 
   role.department_id = department.id;`;
  connection.query(query, (err, data) => {
    if (err) throw err;
    console.table(data);
    mainMenu();
  });
}

function AddRole() {
  const query = `SELECT department.name FROM department`;
  connection.query(query, (err, data) => {
    if (err) throw err;
    const departments = data.map((item) => `${item.name}`);
    inquirer
      .prompt([
        {
          type: "input",
          name: "title",
          message: "What is the title of the role?",
        },
        {
          type: "input",
          name: "salary",
          message: "What is the salary of the role?",
        },
        {
          type: "list",
          name: "department_name",
          message: "What is the department of the role?",
          choices: [...departments],
        },
      ])
      .then((data) => {
        const { title, salary, department_name } = data;
        connection.query(
          `INSERT INTO role (title, salary, department_id)
             SELECT ?, ?, department.id
             FROM department
             WHERE department.name = ?`,
          [title, salary, department_name],
          (err, res) => {
            if (err) throw err;
            console.log(
              `\n-------------------\n Role ${title} has been added!\n`
            );
            ViewAllRoles();
          }
        );
      });
  });
}

function RemoveRole() {
  connection.query("SELECT role.title FROM role", (err, data) => {
    const roles = data.map((item) => `${item.title}`);

    inquirer
      .prompt([
        {
          type: "list",
          name: "title",
          message: "Select a role you want to remove?",
          choices: [...roles],
        },
      ])
      .then((data) => {
        const { title } = data;
        connection.query(
          "SELECT * FROM role WHERE title = '" + title + "'",
          (err, res) => {
            if (err) throw err;
            if (res.length === 0) {
              console.log(`Role with title ${data.title} does not exist.`);
            }

            if (res.length !== 0) {
              connection.query(
                "DELETE FROM role WHERE title = '" + title + "'",
                (err, res) => {
                  if (err) throw err;
                  if (res.affectedRows === 0) {
                    console.log(
                      `Role with title ${data.title} does not exist.`
                    );
                  } else {
                    console.table({
                      message: `\n-------------------\n Role with title ${data.title} has been removed.\n`,
                      affectedRows: res.affectedRows,
                    });
                    ViewAllRoles();
                  }
                }
              );
            }
          }
        );
      });
  });
}

function ViewAllDepartments() {
  const query = `SELECT 
  department.id, 
  department.name FROM 
  department;`;
  connection.query(query, (err, data) => {
    if (err) throw err;
    console.table(data);
    mainMenu();
  });
}

function AddDepartment() {

  inquirer
    .prompt([
      {
        type: "input",
        name: "name",
        message: "What is the name of the department?",
      },
    ])
    .then((data) => {
      const { name } = data;
      connection.query(
        `INSERT INTO department (name) VALUES (?)`,
        [name],
        (err, res) => {
          if (err) throw err;
          console.log(
            `\n-------------------\n Department ${name} has been added!\n`
          );
          ViewAllDepartments();
        }
      );
    });
}

function RemoveDepartment() {
  connection.query("SELECT department.name FROM department", (err, data) => {
    const departments = data.map((item) => `${item.name}`);
    inquirer
      .prompt([
        {
          type: "list",
          name: "name",
          message: "Select a department you want to remove?",
          choices: [...departments],
        },
      ])
      .then((data) => {
        const { name } = data;
        connection.query(
          "SELECT * FROM department WHERE name = '" + name + "'",
          (err, res) => {
            if (err) throw err;
            if (res.length === 0) {
              console.log(`Department with name ${data.name} does not exist.`);
            }

            if (res.length !== 0) {
              connection.query(
                "DELETE FROM department WHERE name = '" + name + "'",
                (err, res) => {
                  if (err) throw err;
                  if (res.affectedRows === 0) {
                    console.log(
                      `Department with name ${data.name} does not exist.`
                    );
                  } else {
                    console.table({
                      message: `\n-------------------\n Department with name ${data.name} has been removed.\n`,
                      affectedRows: res.affectedRows,
                    });
                    ViewAllDepartments();
                  }
                }
              );
            }
          }
        );
      });
  });
}

function ViewTotalUtilizedBudgetByDepartment() {
  const query = `SELECT department.name AS department, 
   SUM(role.salary) AS utilized_budget FROM employee 
   LEFT JOIN role ON employee.role_id = role.id 
   LEFT JOIN department ON role.department_id = department.id 
   GROUP BY department.name;`;
  connection.query(query, (err, data) => {
    if (err) throw err;
    console.table(data);
    mainMenu();
  });
}

function Exit() {
  console.log("Goodbye!");
  connection.end();
}

mainMenu();
