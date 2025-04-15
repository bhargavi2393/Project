import React, { useState } from 'react';
import { View, TextInput, StyleSheet, FlatList, Text, TouchableOpacity, PanResponder, Animated, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';

const TaskScreen = () => {
  const navigation = useNavigation();
  

  const handleLogout = () => {
    auth()
      .signOut()
      .then(() => console.log('User signed out!'))
      .catch(err => alert(err.message));
  };

  

 

  return (
    <View style={styles.container}>
      {/* Header with "Tasks" aligned left and "Track Expense" button on the right */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Tasks</Text>
        <TouchableOpacity style={styles.expenseButton} onPress={() => navigation.navigate('BudgetScreen')}>
          <Text style={styles.expenseButtonText}>Track Expense</Text></TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.expenseButton}>
        <Text style={styles.expenseButtonText}>Logout</Text>
      </TouchableOpacity>
      </View>

     
       
      
       
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f5',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    width: '100%',
  },
  headerText: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
  },
  expenseButton: {
    backgroundColor: 'black',
    padding: 8,
    borderRadius: 8,
  },
  expenseButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    alignSelf: 'center',
    marginTop: 20,
  },
  input: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: 'lightgray',
    color: 'black',
    paddingVertical: 5,
    backgroundColor: 'transparent',
  },
  tickButton: {
    marginLeft: 10,
    backgroundColor: 'black',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskItem: {
    backgroundColor: 'transparent',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    width: '80%',
    alignSelf: 'flex-start',
  },
  taskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskText: {
    fontSize: 16,
    color: '#333',
  },
  descriptionText: {
    fontSize: 14,
    color: 'gray',
    marginTop: 5,
  },
  centeredButton: {
    backgroundColor: 'black',
    padding: 12,
    borderRadius: 20,
    position: 'absolute',
    top: '50%',
    alignSelf: 'center',
    transform: [{ translateY: -25 }],
  },
  bottomButton: {
    backgroundColor: 'black',
    padding: 12,
    borderRadius: 20,
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'white',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: 'gray',
    color: 'black',
    paddingVertical: 5,
  },
  okButton: {
    marginLeft: 10,
    backgroundColor: 'black',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TaskScreen;
