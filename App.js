import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import TaskScreen from './TaskScreen';  // Import TaskScreen from a separate file
import BudgetScreen from './BudgetScreen';
import ForgotPasswordScreen from './ForgotPasswordScreen';
import auth from '@react-native-firebase/auth';

// Login Screen Component
const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hustle</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="gray"
        value={username}
        onChangeText={setUsername}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="gray"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.loginButton} onPress={async () => {
    try {
      await auth().signInWithEmailAndPassword(username, password); // assuming username = email
      navigation.navigate('Tasks');
    } catch (error) {
      alert(error.message);
    }
  }}>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
      <Text style={styles.signupText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.signupText}>New user? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

// SignUp Screen Component
const SignUpScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="gray"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="gray"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="gray"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.signupButton} onPress={async () => {
    try {
      await auth().createUserWithEmailAndPassword(email, password);
      alert('Account created!');
      navigation.navigate('Login');
    } catch (error) {
      alert(error.message);
    }
  }}>
        <Text style={styles.loginText}>Sign Up</Text>
      </TouchableOpacity>

     <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.signupText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const Stack = createStackNavigator();

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(currentUser => {
      setUser(currentUser);
      if (initializing) setInitializing(false);
    });
    return unsubscribe; // Cleanup
  }, []);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Tasks" component={TaskScreen} />
            <Stack.Screen name="BudgetScreen" component={BudgetScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
 
  loginButton: {
    backgroundColor: 'black',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
  },
  signupButton: {
    backgroundColor: 'blue',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
  },
  loginText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupText: {
    color: 'blue',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
});
