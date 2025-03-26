import React, { useState } from 'react';
import { View, TextInput, StyleSheet, FlatList, Text, TouchableOpacity, PanResponder, Animated, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';

const App = () => {
  const navigation = useNavigation();
  const [task, setTask] = useState('');
  const [incompleteTasks, setIncompleteTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(null);
  const [description, setDescription] = useState('');

  const addTask = () => {
    if (task.trim() && task.length <= 100) {
      setIncompleteTasks(prevTasks =>
        prevTasks.length < 50 ? [...prevTasks, { text: task, description: '' }] : prevTasks
      );
      setTask('');
      setShowInput(false);
    }
  };

  const completeTask = (index) => {
    setCompletedTasks([...completedTasks, incompleteTasks[index]]);
    setIncompleteTasks(incompleteTasks.filter((_, i) => i !== index));
  };

  const openDescriptionModal = (index) => {
    setSelectedTaskIndex(index);
    setModalVisible(true);
  };

  const saveDescription = () => {
    if (selectedTaskIndex !== null && description.length <= 200) {
      const updatedTasks = [...incompleteTasks];
      updatedTasks[selectedTaskIndex].description = description;
      setIncompleteTasks(updatedTasks);
      setDescription('');
      setModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with "Tasks" aligned left and "Track Expense" button on the right */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Tasks</Text>
        <TouchableOpacity style={styles.expenseButton} onPress={() => navigation.navigate('BudgetScreen')}>
          <Text style={styles.expenseButtonText}>Track Expense</Text></TouchableOpacity>
      </View>

      {showInput && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter a task"
            placeholderTextColor="lightgray"
            value={task}
            onChangeText={text => text.length <= 100 && setTask(text)}/>
          <TouchableOpacity style={styles.tickButton} onPress={addTask}>
            <Icon name="check" size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={incompleteTasks}
        renderItem={({ item, index }) => {
          const pan = new Animated.ValueXY();
          const panResponder = PanResponder.create({
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: Animated.event([
              null,
              { dx: pan.x }
            ], { useNativeDriver: false }),
            onPanResponderRelease: (evt, gestureState) => {
              if (gestureState.dx > 100) {
                completeTask(index);
              } else {
                Animated.spring(pan, {
                  toValue: { x: 0, y: 0 },
                  useNativeDriver: false,
                }).start();
              }
            },
          });
          return (
            <Animated.View {...panResponder.panHandlers} style={[styles.taskItem, { transform: [{ translateX: pan.x }] }]}>
              <View style={styles.taskRow}>
                <Text style={styles.taskText}>{item.text.length > 50 ? item.text.substring(0, 50) + '...' : item.text}</Text>
                <TouchableOpacity onPress={() => openDescriptionModal(index)}>
                  <Icon name="ellipsis1" size={20} color="#333" />
                </TouchableOpacity>
              </View>
              {item.description ? <Text style={styles.descriptionText}>{item.description.length > 75 ? item.description.substring(0, 75) + '...' : item.description}</Text> : null}
            </Animated.View>
          );
        }}
        keyExtractor={(item, index) => index.toString()}
      />

      <TouchableOpacity
        style={incompleteTasks.length === 0 ? styles.centeredButton : styles.bottomButton}
        onPress={() => setShowInput(true)}
      >
        <Text style={styles.buttonText}>Add a new task</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.modalInput}
            placeholder="Enter description"
            placeholderTextColor="gray"
            value={description}
            onChangeText={text => text.length <= 200 && setDescription(text)}
          />
          <TouchableOpacity style={styles.okButton} onPress={saveDescription}>
            <Icon name="check" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </Modal>
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

export default App;
