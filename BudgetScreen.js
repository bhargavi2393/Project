import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import DatePicker from 'react-native-date-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import Toast from 'react-native-toast-message';

const BudgetScreen = () => {
  const [date, setDate] = useState(new Date());
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [open, setOpen] = useState(false);
  const [expenses, setExpenses] = useState({});

  const handleAmountChange = (text) => {
    if (/^\d*\.?\d*$/.test(text)) {
      setAmount(text);
    }
  };

  const getFormattedDate = () => {
    const today = new Date().toISOString().split('T')[0];
    const selectedDate = date.toISOString().split('T')[0];
    return selectedDate === today ? 'Today' : selectedDate;
  };

  const addExpense = () => {
    if (description && amount) {
      const selectedDate = date.toISOString().split('T')[0];

      setExpenses((prevExpenses) => ({
        ...prevExpenses,
        [selectedDate]: [...(prevExpenses[selectedDate] || []), { description, amount: parseFloat(amount) }],
      }));

      const updatedTotal = (expenses[selectedDate] || []).reduce((sum, item) => sum + item.amount, 0) + parseFloat(amount);

      // Show push notification with updated total
      Toast.show({
        type: 'success',
        text1: 'Expense Added',
        text2: `Today's total: ₹${updatedTotal.toFixed(2)}`,
        position: 'top',
      });

      setDescription('');
      setAmount('');
    }
  };

  const todayDate = new Date().toISOString().split('T')[0];
  const totalExpenseToday = (expenses[todayDate] || []).reduce((sum, item) => sum + item.amount, 0);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Budget Tracker</Text>
      </View>

      <Text style={styles.totalExpenseText}>
        Today's Expenses: ₹{totalExpenseToday.toFixed(2)}
      </Text>

      <View style={styles.inputRow}>
        <TouchableOpacity style={styles.dateButton} onPress={() => setOpen(true)}>
          <Text style={styles.dateButtonText}>{getFormattedDate()}</Text>
        </TouchableOpacity>

        <DatePicker
          modal
          open={open}
          date={date}
          mode="date"
          onConfirm={(selectedDate) => {
            setOpen(false);
            setDate(selectedDate);
          }}
          onCancel={() => setOpen(false)}
        />

        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="Description"
          maxLength={50}
        />

        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={handleAmountChange}
          placeholder="Amount"
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.addButton} onPress={addExpense}>
          <Icon name="plus" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={expenses[todayDate] || []}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.expenseItem}>
            <Text style={styles.expenseText}>{item.description}</Text>
            <Text style={styles.expenseText}>₹{item.amount.toFixed(2)}</Text>
          </View>
        )}
      />

      {/* Toast Message Container */}
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: 20,
    backgroundColor: '#F5F5F5',
  },

  headerRow: {
    alignItems: 'center',
    marginBottom: 15,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },

  totalExpenseText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  dateButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    width: '25%',
    alignItems: 'center',
    backgroundColor: 'white',
  },

  dateButtonText: {
    fontSize: 16,
    color: 'black',
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    width: '25%',
    backgroundColor: 'white',
  },

  addButton: {
    borderWidth: 1.5,
    borderColor: 'black',
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },

  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    marginBottom: 8,
    elevation: 2,
  },

  expenseText: {
    fontSize: 16,
  },
});

export default BudgetScreen;
