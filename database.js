import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase(
  { name: 'expenses.db', location: 'default' },
  () => console.log('DB Opened'),
  err => console.log('DB Error: ', err)
);

export const createTables = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS Expenses (
        userEmail TEXT NOT NULL,
        date DATE NOT NULL,
        itemName TEXT NOT NULL,
        price REAL NOT NULL,
        quantity REAL NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL
      );`,
      [],
      () => console.log('✅ Expenses table created.'),
      (_, error) => {
        console.log('❌ Table creation failed:', error.message);
        return false;
      }
    );
    tx.executeSql(
        `CREATE TABLE IF NOT EXISTS Categories (
          userEmail TEXT NOT NULL,
          name TEXT UNIQUE NOT NULL,
          limit_day REAL,
          limit_month REAL,
          limit_year REAL,
          UNIQUE(userEmail, name)
        );`,
        [],
      () => console.log('✅ Category  table created.'),
      (_, error) => {
        console.log('❌ Table creation failed:', error.message);
        return false;
      }
      );
     });
};

export const insertExpense = (userEmail, date, itemName, price, quantity, amount, category, callback) => {
  db.transaction(tx => {
    tx.executeSql(
        `INSERT INTO Expenses (userEmail, date, itemName, price, quantity, amount, category) VALUES (?, ?, ?, ?, ?, ?, ?);`,
  [userEmail, date, itemName, price, quantity, amount, category],
  (_, result) => {
    console.log('✅ Expense inserted successfully:', result);
    callback && callback();
  },
  (_, error) => {
    console.error('❌ Insert error:', error.message);
    return false;
     }
    );
  });
};

export const insertCategory = (userEmail,name, limitDay, limitMonth, limitYear, callback) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT OR REPLACE INTO Categories (userEmail, name, limit_day, limit_month, limit_year) VALUES (?, ?, ?, ?, ?);',
        [userEmail, name, limitDay, limitMonth, limitYear],
        (_, result) => {
          console.log('✅ Category inserted successfully:', result);
          callback && callback();
        }
        ,
        (_, error) => {
          console.log('❌ Insert category error:', error.message);
          return false;
        }
      );
    });
  };


export const fetchAllExpensesForUser = (userEmail, callback) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Expenses WHERE userEmail = ?;',
        [userEmail],
        (_, { rows }) => {
          console.log('📥 Expense Data:', rows.raw()); // or rows.raw() depending on your SQLite lib
          callback(rows.raw()); // or rows.raw()
        },
        (_, err) => {
          console.log('❌ Fetch all expenses error:', err.message);
          return false;
        }
      );
    });
  };

  export const fetchAllCategoriesForUser = (userEmail, callback) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Categories WHERE userEmail = ?;',
        [userEmail],
        (_, { rows }) => {
          console.log('📥 User-specific categories:', rows.raw()); // or rows.raw() depending on your SQLite lib
          callback(rows.raw()); // or rows.raw()
        },
        (_, err) => {
          console.log('❌ Fetch categories error:', err.message);
          return false;
        }
      );
    });
  };
  
  export const deleteAllCategories = (callback) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM Categories;',
        [],
        () => {
          console.log('🗑️ All category records deleted');
          callback && callback();
        },
        (_, error) => {
          console.log('❌ Delete failed:', error.message);
          return false;
        }
      );
    });
  };


export const fetchExpensesBySingle = (userEmail, type, value, callback) => {
  let query = '';
  let args = [userEmail];

  if (type === 'date') {
    query = 'SELECT * FROM Expenses WHERE userEmail = ? AND date = ?';
    args.push(value);
  } else if (type === 'month') {
    query = 'SELECT * FROM Expenses WHERE userEmail = ? AND strftime("%m", date) = ? AND strftime("%Y", date) = ?';
    const [month, year] = value.split('-');
    args.push(month, year);
  } else if (type === 'year') {
    query = 'SELECT * FROM Expenses WHERE userEmail = ? AND strftime("%Y", date) = ?';
    args.push(value);
  }

  db.transaction(tx => {
    tx.executeSql(
      query,
      args,
      (_, { rows }) => callback(rows._array),
      (_, error) => console.error('Fetch single type error:', error)
    );
  });
};

export const fetchExpensesByDuration = (userEmail, type, from, to, callback) => {
  let query = '';
  let args = [userEmail];

  if (type === 'date') {
    query = 'SELECT * FROM Expenses WHERE userEmail = ? AND date BETWEEN ? AND ?';
    args.push(from, to);
  } else if (type === 'month') {
    query = `SELECT * FROM Expenses 
             WHERE userEmail = ? 
             AND (strftime('%Y-%m', date) BETWEEN ? AND ?)`;
    args.push(from, to);
  } else if (type === 'year') {
    query = `SELECT * FROM Expenses 
             WHERE userEmail = ? 
             AND (strftime('%Y', date) BETWEEN ? AND ?)`;
    args.push(from, to);
  }

  db.transaction(tx => {
    tx.executeSql(
      query,
      args,
      (_, { rows }) => callback(rows._array),
      (_, error) => console.error('Fetch duration type error:', error)
    );
  });
};


// Fetch by exact date (YYYY-MM-DD)
export const fetchExpensesByDate = (userEmail, date, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      `SELECT * FROM Expenses WHERE userEmail = ? AND date = ?`,
      [userEmail, date],
      (_, { rows }) => callback(rows.raw()),
      (_, err) => console.error('fetchExpensesByDate error:', err)
    );
  });
};

// Fetch by month (MM and YYYY)
export const fetchExpensesByMonth = (userEmail, month, year, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      `SELECT * FROM Expenses WHERE userEmail = ? AND strftime('%m', date) = ? AND strftime('%Y', date) = ?`,
      [userEmail, month.padStart(2, '0'), year],
      (_, { rows }) => callback(rows.raw()),
      (_, err) => console.error('fetchExpensesByMonth error:', err)
    );
  });
};

// Fetch by year (YYYY)
export const fetchExpensesByYear = (userEmail, year, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      `SELECT * FROM Expenses WHERE userEmail = ? AND strftime('%Y', date) = ?`,
      [userEmail, year],
      (_, { rows }) => callback(rows.raw()),
      (_, err) => console.error('fetchExpensesByYear error:', err)
    );
  });
};

// Fetch by date range (YYYY-MM-DD to YYYY-MM-DD)
export const fetchExpensesByDateRange = (userEmail, from, to, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      `SELECT * FROM Expenses WHERE userEmail = ? AND date BETWEEN ? AND ?`,
      [userEmail, from, to],
      (_, { rows }) => callback(rows.raw()),
      (_, err) => console.error('fetchExpensesByDateRange error:', err)
    );
  });
};

// Fetch by month range (YYYY-MM to YYYY-MM)
export const fetchExpensesByMonthRange = (userEmail, fromMonth, fromYear, toMonth, toYear, callback) => {
  const from = `${fromYear}-${fromMonth.padStart(2, '0')}`;
  const to = `${toYear}-${toMonth.padStart(2, '0')}`;
  db.transaction(tx => {
    tx.executeSql(
      `SELECT * FROM Expenses WHERE userEmail = ? AND strftime('%Y-%m', date) BETWEEN ? AND ?`,
      [userEmail, from, to],
      (_, { rows }) => callback(rows.raw()),
      (_, err) => console.error('fetchExpensesByMonthRange error:', err)
    );
  });
};

// Fetch by year range (YYYY to YYYY)
export const fetchExpensesByYearRange = (userEmail, fromYear, toYear, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      `SELECT * FROM Expenses WHERE userEmail = ? AND strftime('%Y', date) BETWEEN ? AND ?`,
      [userEmail, fromYear, toYear],
      (_, { rows }) => callback(rows.raw()),
      (_, err) => console.error('fetchExpensesByYearRange error:', err)
    );
  });
};

export const fetchExpensesForDate = (userEmail, date, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      `SELECT * FROM expenses WHERE userEmail = ? AND date = ? `,
      [userEmail, date],
      (_, { rows }) => callback(rows.raw()),
      (_, err) => console.error('fetchExpensesByDate error:', err)
      
    );
  });
};


export const updateExpense = (expense, callback) => {
  const { itemName, price, quantity, category, date } = expense;
  const amount = Number(price) * Number(quantity);

  db.transaction(tx => {
    tx.executeSql(
      `UPDATE expenses SET itemName = ?, price = ?, quantity = ?, amount = ?, category = ?, date = ?`,
      [itemName, price, quantity, amount, category, date],
      () => callback(),
      (_, error) => {
        console.error('❌ Error updating expense:', error);
        return true;
      }
    );
  });
};

export const deleteExpense = (callback) => {
  db.transaction(tx => {
    tx.executeSql(
      `DELETE FROM expenses`,
      [],
      () => callback(),
      (_, error) => {
        console.error('❌ Error deleting expense:', error);
        return true;
      }
    );
  });
};

