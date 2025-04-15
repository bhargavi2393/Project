import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import Toast from 'react-native-toast-message';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import isoWeek from 'dayjs/plugin/isoWeek';
import { Picker } from '@react-native-picker/picker';
import { createTables,
  insertExpense,
  fetchAllExpensesForUser,
  insertCategory,
  fetchAllCategoriesForUser,
  deleteAllCategories,
fetchExpensesBySingle,
fetchExpensesByDuration,
fetchExpensesByDate,
fetchExpensesByDateRange,
fetchExpensesByMonth,
fetchExpensesByMonthRange,
fetchExpensesByYear,
fetchExpensesByYearRange,
fetchExpensesForDate,
updateExpense,
deleteExpense } from './database';
import auth from '@react-native-firebase/auth';

dayjs.extend(isBetween);
dayjs.extend(isoWeek);

const BudgetScreen = () => {
  const [expenses, setExpenses] = useState([]);
  const [totals, setTotals] = useState({ day: 0, week: 0, month: 0, year: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [limits, setLimits] = useState({ day: '', month: '', year: '' });
  const [date, setDate] = useState(new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('');
  const [viewMode, setViewMode] = useState('day');
  const [userEmail, setUserEmail] = useState('');
  const [username, setUsername] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [fetchModalVisible, setFetchModalVisible] = useState(false);
  const [dateType, setDateType] = useState('single'); // default selection
  const [singleMode, setSingleMode] = useState('date'); // 'date' | 'month' | 'year'
const [singleDate, setSingleDate] = useState(new Date());
const [openSingleDatePicker, setOpenSingleDatePicker] = useState(false);
const [rangeMode, setRangeMode] = useState('date'); // For duration
const [fromDate, setFromDate] = useState(new Date());
const [toDate, setToDate] = useState(new Date());
const [openFromPicker, setOpenFromPicker] = useState(false);
const [openToPicker, setOpenToPicker] = useState(false);
const [durationMode, setDurationMode] = useState('date');
const [filteredExpenses, setFilteredExpenses] = useState([]);
const [editDate, setEditDate] = useState(new Date());
  const [editExpenses, setEditExpenses] = useState([]);
  const [openEditDatePicker, setOpenEditDatePicker] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [openDatePickerIndex, setOpenDatePickerIndex] = useState(null);







  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user) {
        const email = user.email;
        const name = user.displayName || email.split('@')[0];
        console.log('✅ User from onAuthStateChanged:', email);
        setUserEmail(email);
        setUsername(name);
        createTables();
  
        fetchAllExpensesForUser(email, (data) => {
          const cleaned = data.map(e => ({
            ...e,
            date: dayjs(e.date).format('YYYY-MM-DD'),
            amount: Number(e.amount)
          }));
          console.log('✅ Expenses:', cleaned);
          setExpenses(cleaned);
        });
  
        fetchAllCategoriesForUser(email, (data) => {
          console.log('✅ Categories:', data);
          setCategories(data);
        });
      } else {
        console.log('❌ User not logged in');
      }
    });
  
    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  const getDisplayDate = (date, mode) => {
    if (mode === 'date') return dayjs(date).format('YYYY-MM-DD');
    if (mode === 'month') return dayjs(date).format('MMMM YYYY');
    if (mode === 'year') return dayjs(date).format('YYYY');
    return '';
  };
  

  const resetExpenseModal = () => {
    setModalVisible(false);
    setItemName('');
    setPrice('');
    setQuantity('');
    setDate(new Date());
    setCategory('');
  };


  const handleAddExpense = () => {
    if (!itemName || !price || !quantity || !category) {
      Toast.show({
        type: 'error',
        text1: 'Please fill all fields',
      });
      return;
    }

    if (!userEmail) {
      Toast.show({ type: 'error', text1: 'User not identified' });
      return;
    }
    

    const priceNum = parseFloat(price);
    const quantityNum = parseFloat(quantity);
    const amount = priceNum * quantityNum;

    if (isNaN(priceNum) || isNaN(quantityNum) || isNaN(amount)) {
      Toast.show({ type: 'error', text1: 'Please enter valid numbers' });
      return;
    }

    const newExpense = {
      date: dayjs(date).format('YYYY-MM-DD'),
      itemName,
      price: priceNum,
      quantity: quantityNum,
      amount,
      category,
    };

    insertExpense(
      userEmail,
      newExpense.date,
      newExpense.itemName,
      newExpense.price,
      newExpense.quantity,
      newExpense.amount,
      newExpense.category,
      () => {
        fetchAllExpensesForUser(userEmail, (data) => {
          const cleaned = data.map(e => ({
            ...e,
            date: dayjs(e.date).format('YYYY-MM-DD'),
            amount: Number(e.amount)
          }));
          console.log('✅ Cleaned after insert:', cleaned);
          setExpenses(cleaned);
        });
      }
    );

    resetExpenseModal();
    Toast.show({
      type: 'success',
      text1: 'Expense Added',
      text2: `${itemName} - ₹${amount.toFixed(2)}`,
    });
  };

  const handleAddCategory = () => {
    if (!newCategory || !userEmail) {
      Toast.show({ type: 'error', text1: 'Category name and user are required' });
      return;
    }
  
    const day = parseFloat(limits.day) || 0;
    const month = parseFloat(limits.month) || 0;
    const year = parseFloat(limits.year) || 0;
  
    insertCategory(userEmail, newCategory, day, month, year, () => {
      // Don't wait for fetchAllCategories to update the UI
      setCategories(prev => [...prev, {
        userEmail,
        name: newCategory,
        limit_day: day,
        limit_month: month,
        limit_year: year
      }]);
  
      setNewCategory('');
      setLimits({ day: '', month: '', year: '' });
      setCategoryModalVisible(false);
  
      Toast.show({
        type: 'success',
        text1: 'Category Added',
        text2: `${newCategory}`,
      });
    });
  };
  

  const cycleViewMode = () => {
    const modes = ['day', 'week', 'month', 'year'];
    const nextIndex = (modes.indexOf(viewMode) + 1) % modes.length;
    setViewMode(modes[nextIndex]);
  };

  const totalExpense = useMemo(() => {
    const today = dayjs();
    return expenses.reduce((sum, e) => {
      const d = dayjs(e.date, 'YYYY-MM-DD');
      if (viewMode === 'day' && d.isSame(today, 'day')) return sum + e.amount;
      if (viewMode === 'week' && d.isBetween(today.startOf('week'), today.endOf('week'), null, '[]')) return sum + e.amount;
      if (viewMode === 'month' && d.isSame(today, 'month')) return sum + e.amount;
      if (viewMode === 'year' && d.isSame(today, 'year')) return sum + e.amount;
      return sum;
    }, 0);
  }, [expenses, viewMode]);

  const calculatedAmount = (parseFloat(price) || 0) * (parseFloat(quantity) || 0);

  const viewModeText = {
    day: 'Today',
    week: 'This Week',
    month: 'This Month',
    year: 'This Year',
  };

  const handleLogout = () => {
    auth()
      .signOut()
      .then(() => console.log('User signed out!'))
      .catch(err => alert(err.message));
  };
  
  const handleFetch = () => {
    if (!userEmail) return;

    if (dateType === 'single') {
      const formattedDate = dayjs(singleDate);
      if (singleMode === 'date') fetchExpensesByDate(userEmail, formattedDate.format('YYYY-MM-DD'), setFilteredExpenses);
      if (singleMode === 'month') fetchExpensesByMonth(userEmail, formattedDate.format('MM'), formattedDate.format('YYYY'), setFilteredExpenses);
      if (singleMode === 'year') fetchExpensesByYear(userEmail, formattedDate.format('YYYY'), setFilteredExpenses);
    } else {
      const from = dayjs(fromDate);
      const to = dayjs(toDate);
      if (!from.isBefore(to)) {
        Toast.show({ type: 'error', text1: 'Invalid Range', text2: 'End must be after start' });
        return;
      }
      if (durationMode === 'date') fetchExpensesByDateRange(userEmail, from.format('YYYY-MM-DD'), to.format('YYYY-MM-DD'), setFilteredExpenses);
      if (durationMode === 'month') fetchExpensesByMonthRange(userEmail, from.format('MM'), from.format('YYYY'), to.format('MM'), to.format('YYYY'), setFilteredExpenses);
      if (durationMode === 'year') fetchExpensesByYearRange(userEmail, from.format('YYYY'), to.format('YYYY'), setFilteredExpenses);
    }
  };

  const handleEditOpen = () => {
    if (!userEmail) return;
    fetchExpensesForDate(userEmail, dayjs(editDate).format('YYYY-MM-DD'), setEditExpenses);
    setEditModalVisible(true);
  };

  const handleUpdateExpense = (expense) => {
    updateExpense(expense, () => Toast.show({ type: 'success', text1: 'Updated successfully' }));
  };

  const handleDeleteExpense = (id) => {
    deleteExpense(id, () => {
      setEditExpenses(prev => prev.filter(e => e.id !== id));
      Toast.show({ type: 'success', text1: 'Deleted successfully' });
    });
  };

  

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
  <Text style={styles.title}>Budget Tracker</Text>
  
  <View style={styles.userDropdownContainer}>
    <TouchableOpacity onPress={() => setDropdownVisible(!dropdownVisible)} style={styles.dropdownToggle}>
      <Text style={styles.username}>{username}</Text>
    </TouchableOpacity>

    {dropdownVisible && (
      <View style={styles.dropdownMenu}>
        <TouchableOpacity
          onPress={() => {
            setDropdownVisible(false);
            setCategoryModalVisible(true);
          }}
        >
          <Text style={styles.dropdownItem}>Manage Categories</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setDropdownVisible(false);
            handleLogout();
          }}
        >
          <Text style={styles.dropdownItem}>Logout</Text>
        </TouchableOpacity>
      </View>
    )}
  </View>
</View>

<TouchableOpacity
  style={styles.saveButton}
  onPress={() => setFetchModalVisible(true)}
>
  <Text style={styles.buttonText}>Fetch</Text>
</TouchableOpacity>

<Modal visible={fetchModalVisible} transparent animationType="slide" onRequestClose={() => setFetchModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modal}>
            <FlatList
              ListHeaderComponent={
                <>
                  <Text style={styles.title}>Fetch Expenses</Text>

                  <View style={styles.radioGroup}>
                    <TouchableOpacity onPress={() => setDateType('single')} style={styles.radioButton}>
                      <Icon name={dateType === 'single' ? 'dot-circle-o' : 'circle-o'} size={18} />
                      <Text style={styles.radioText}>Single</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setDateType('duration')} style={styles.radioButton}>
                      <Icon name={dateType === 'duration' ? 'dot-circle-o' : 'circle-o'} size={18} />
                      <Text style={styles.radioText}>Duration</Text>
                    </TouchableOpacity>
                  </View>

                  {dateType === 'single' && (
                    <>
                      <Text style={styles.sectionTitle}>Choose Type</Text>
                      <Picker selectedValue={singleMode} onValueChange={val => setSingleMode(val)} style={{ marginBottom: 10 }}>
                        <Picker.Item label="Date" value="date" />
                        <Picker.Item label="Month" value="month" />
                        <Picker.Item label="Year" value="year" />
                      </Picker>

                      <TouchableOpacity onPress={() => setOpenSingleDatePicker(true)} style={styles.dateButton}>
                        <Text>{getDisplayDate(singleDate, singleMode)}</Text>
                      </TouchableOpacity>

                      <DatePicker
                        modal
                        open={openSingleDatePicker}
                        date={singleDate}
                        mode="date"
                        onConfirm={(date) => {
                          setOpenSingleDatePicker(false);
                          setSingleDate(date);
                        }}
                        onCancel={() => setOpenSingleDatePicker(false)}
                      />
                    </>
                  )}

                  {dateType === 'duration' && (
                    <>
                      <Text style={styles.sectionTitle}>Choose Type</Text>
                      <Picker selectedValue={durationMode} onValueChange={val => setDurationMode(val)} style={{ marginBottom: 10 }}>
                        <Picker.Item label="Date" value="date" />
                        <Picker.Item label="Month" value="month" />
                        <Picker.Item label="Year" value="year" />
                      </Picker>

                      <Text style={styles.sectionTitle}>From</Text>
                      <TouchableOpacity onPress={() => setOpenFromPicker(true)} style={styles.dateButton}>
                        <Text>{getDisplayDate(fromDate, durationMode)}</Text>
                      </TouchableOpacity>
                      <DatePicker
                        modal
                        open={openFromPicker}
                        date={fromDate}
                        mode="date"
                        onConfirm={(date) => {
                          setOpenFromPicker(false);
                          setFromDate(date);
                        }}
                        onCancel={() => setOpenFromPicker(false)}
                      />

                      <Text style={styles.sectionTitle}>To</Text>
                      <TouchableOpacity onPress={() => setOpenToPicker(true)} style={styles.dateButton}>
                        <Text>{getDisplayDate(toDate, durationMode)}</Text>
                      </TouchableOpacity>
                      <DatePicker
                        modal
                        open={openToPicker}
                        date={toDate}
                        mode="date"
                        onConfirm={(date) => {
                          if (dayjs(date).isBefore(dayjs(fromDate))) {
                            Toast.show({ type: 'error', text1: 'Invalid Range', text2: 'End date must be after start date' });
                            setOpenToPicker(false);
                            return;
                          }
                          setOpenToPicker(false);
                          setToDate(date);
                        }}
                        onCancel={() => setOpenToPicker(false)}
                      />
                    </>
                  )}

                  <TouchableOpacity style={[styles.button, styles.saveButton, { marginVertical: 10 }]} onPress={handleFetch}>
                    <Text style={styles.buttonText}>Get Expenses</Text>
                  </TouchableOpacity>
                </>
              }
              data={filteredExpenses}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.expenseItem}>
                  <Text>{item.itemName} - ₹{item.amount} on {item.date}</Text>
                </View>
              )}
              ListFooterComponent={
                <>
                  {filteredExpenses.length > 0 && (
                    <Text style={styles.totalText}>Total: ₹{filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0).toFixed(2)}</Text>
                  )}
                  <Pressable style={[styles.button, styles.cancelButton, { marginTop: 10 }]} onPress={() => setFetchModalVisible(false)}>
                    <Text style={styles.buttonText}>Close</Text>
                  </Pressable>
                </>
              }
            />
          </View>
        </View>
      </Modal>
      <TouchableOpacity style={styles.fetchButton} onPress={handleEditOpen}>
        <Text style={styles.buttonText}>Edit</Text>
      </TouchableOpacity>

      <Modal visible={editModalVisible} transparent animationType="slide" onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalContainer}>
          <ScrollView style={styles.modal}>
            <Text style={styles.title}>Edit Existing Expenses</Text>

            <TouchableOpacity onPress={() => setOpenEditDatePicker(true)} style={styles.dateButton}>
              <Text>{dayjs(editDate).format('YYYY-MM-DD')}</Text>
            </TouchableOpacity>

            <DatePicker
              modal
              open={openEditDatePicker}
              date={editDate}
              onConfirm={date => {
                setOpenEditDatePicker(false);
                setEditDate(date);
                fetchExpensesForDate(userEmail, dayjs(date).format('YYYY-MM-DD'), setEditExpenses);
              }}
              onCancel={() => setOpenEditDatePicker(false)}
              mode="date"
            />

{editExpenses.map((expense, idx) => (
  <View key={idx} style={styles.expenseItem}>
    <TextInput
      value={expense.itemName}
      onChangeText={text => {
        const updated = [...editExpenses];
        updated[idx].itemName = text;
        setEditExpenses(updated);
      }}
      placeholder="Item Name"
    />
    <TextInput
      value={String(expense.price)}
      keyboardType="numeric"
      onChangeText={text => {
        const updated = [...editExpenses];
        updated[idx].price = text;
        setEditExpenses(updated);
      }}
      placeholder="Price"
    />
    <TextInput
      value={String(expense.quantity)}
      keyboardType="numeric"
      onChangeText={text => {
        const updated = [...editExpenses];
        updated[idx].quantity = text;
        setEditExpenses(updated);
      }}
      placeholder="Quantity"
    />

<TouchableOpacity
  onPress={() => setOpenDatePickerIndex(idx)}
  style={styles.dateButton}
>
  <Text>{expense.date}</Text>
</TouchableOpacity>

<DatePicker
  modal
  open={openDatePickerIndex === idx}
  date={dayjs(expense.date).toDate()}
  onConfirm={(newDate) => {
    const updated = [...editExpenses];
    updated[idx].date = dayjs(newDate).format('YYYY-MM-DD');
    setEditExpenses(updated);
    setOpenDatePickerIndex(null);
  }}
  onCancel={() => setOpenDatePickerIndex(null)}
  mode="date"
/>

    <Picker
      selectedValue={expense.category}
      onValueChange={(val) => {
        const updated = [...editExpenses];
        updated[idx].category = val;
        setEditExpenses(updated);
      }}
      style={{ marginVertical: 4 }}
    >
      {categories.map((cat, i) => (
        <Picker.Item key={i} label={cat.name} value={cat.name} />
      ))}
    </Picker>

    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <TouchableOpacity
        onPress={() => handleUpdateExpense(expense)}
        style={[styles.button, { marginRight: 10 }]}
      >
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this expense?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Yes', onPress: () => handleDeleteExpense(expense.id) },
            ]
          );
        }}
        style={[styles.button, styles.cancelButton]}
      >
        <Text style={styles.buttonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  </View>
))}


            <Pressable style={[styles.button, styles.cancelButton, { marginTop: 10 }]} onPress={() => setEditModalVisible(false)}>
              <Text style={styles.buttonText}>Close</Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>


  <View style={styles.centeredHeader}>
  <TouchableOpacity onPress={cycleViewMode} style={styles.circleButton}>
    <Text style={styles.viewModeLabel}>{viewModeText[viewMode]}</Text>
    <Text style={styles.totalAmount}>₹{totalExpense.toFixed(2)}</Text>
  </TouchableOpacity>
</View>

      

      
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Icon name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      
      {/* Expense Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={resetExpenseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Expense</Text>

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setOpenDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {dayjs(date).isSame(dayjs(), 'day')
                  ? 'Today'
                  : dayjs(date).format('YY-MM-DD')}
              </Text>
            </TouchableOpacity>

            <DatePicker
              modal
              open={openDatePicker}
              date={date}
              mode="date"
              onConfirm={(selectedDate) => {
                setOpenDatePicker(false);
                setDate(selectedDate);
              }}
              onCancel={() => setOpenDatePicker(false)}
            />

            <TextInput
              style={styles.input}
              placeholder="Item Name"
              placeholderTextColor="gray"
              value={itemName}
              onChangeText={setItemName}
            />

            <TextInput
              style={styles.input}
              placeholder="Price per item"
              placeholderTextColor="gray"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />

            <TextInput
              style={styles.input}
              placeholder="Quantity"
              placeholderTextColor="gray"
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
            />

            <View style={styles.input}>
              <Picker
                selectedValue={category}
                onValueChange={(itemValue) => setCategory(itemValue)}>
                <Picker.Item label="Select Category" value="" color="gray" />
                {(categories || []).map((cat, index) => (
                  <Picker.Item key={`${cat.name}-${index}`} label={cat.name} value={cat.name} />
                ))}
              </Picker>
            </View>

            <Text style={styles.amountText}>Amount: ₹{calculatedAmount.toFixed(2)}</Text>

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={resetExpenseModal}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.saveButton]}
                onPress={handleAddExpense}
              >
                <Text style={styles.buttonText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Category Modal */}
      <Modal
        visible={categoryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <ScrollView style={styles.modal}>
            <Text style={styles.modalTitle}>Manage Categories</Text>

            <TextInput
              style={styles.input}
              placeholder="Category Name"
              placeholderTextColor="gray"
              value={newCategory}
              onChangeText={setNewCategory}
            />

            <TextInput
              style={styles.input}
              placeholder="Max per Day"
              placeholderTextColor="gray"
              keyboardType="numeric"
              value={limits.day}
              onChangeText={(val) => setLimits({ ...limits, day: val })}
            />
            <TextInput
              style={styles.input}
              placeholder="Max per Month"
              placeholderTextColor="gray"
              keyboardType="numeric"
              value={limits.month}
              onChangeText={(val) => setLimits({ ...limits, month: val })}
            />
            <TextInput
              style={styles.input}
              placeholder="Max per Year"
              placeholderTextColor="gray"
              keyboardType="numeric"
              value={limits.year}
              onChangeText={(val) => setLimits({ ...limits, year: val })}
            />

            {(categories || []).map((cat) => (
              <View key={cat.name} style={styles.expenseItem}>
                <Text>{cat.name}</Text>
              </View>
            ))}
            <TouchableOpacity
  onPress={() => {
    deleteAllCategories(() => {
      console.log('✅ Categories');
      Toast.show({ type: 'success', text1: 'All categories deleted' });
    });
  }}
  style={{ backgroundColor: 'red', padding: 12, borderRadius: 8, margin: 10 }}
>
  <Text style={{ color: 'white', textAlign: 'center' }}>Delete All Categories</Text>
</TouchableOpacity>


            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={() => setCategoryModalVisible(false)}
              >
                <Text style={styles.buttonText}>Close</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.saveButton, ,
                  (!newCategory || !userEmail) && { backgroundColor: '#888' }]}
                onPress={handleAddCategory}
                disabled={!newCategory || !userEmail}
              >
                <Text style={styles.buttonText}>Add</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  title: { fontSize: 24, fontWeight: 'bold' },
  viewModeText: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 15,
    textAlign: 'center',
  },
  expenseItem: {
    backgroundColor: '#fff',
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 2,
  },
  expenseText: { fontSize: 16 },
  fab: {
    backgroundColor: '#000',
    width: 60,
    height: 60,
    borderRadius: 30,
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  dateText: { fontSize: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 12,
    borderRadius: 8,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#000',
  },
  buttonText: { color: 'white', fontWeight: 'bold' },

  categoryButton: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 10,
  },

  centeredHeader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  
  circleButton: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#fff',       // White inner background
    borderColor: '#000',           // Black border
    borderWidth: 1,                // Thin outline
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    
  },
  
  viewModeLabel: {
    fontSize: 20,
    color: '#000',  // Black text
    fontWeight: '600',
    marginBottom: 6,
    
  },
  
  totalAmount: {
    fontSize: 28,
  color: '#000',  // Black text
  fontWeight: 'bold',
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  
  userDropdown: {
    padding: 8,
    borderRadius: 8,
  },
  
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  
  dropdownMenu: {
    position: 'absolute',
    top: 38,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    elevation: 5,
    zIndex: 10,
  },

  dropdownItem: {
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  
  
  userDropdownContainer: {
    position: 'relative',
  },
  dropdownToggle: {
    padding: 8,
    backgroundColor: '#eee',
    borderRadius: 6,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  
  radioSelected: {
    backgroundColor: '#000',
  },
  radioText: { fontSize: 16 },
  
  radioLabel: {
    fontSize: 16,
    color: '#000',
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  radioGroup: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  radioButton: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fetchButton: { backgroundColor: '#000', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  
});

export default BudgetScreen;
