// APP TUTORIAL 1 ORIGINAL
import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  SafeAreaView,
  Image,
  ScrollView
} from 'react-native';
import {API, graphqlOperation} from 'aws-amplify';
import {createTodo} from './src/graphql/mutations';
import {listTodos} from './src/graphql/queries';
import {
  withAuthenticator,
  useAuthenticator,
} from '@aws-amplify/ui-react-native';

import { Amplify } from 'aws-amplify';
import awsExports from './src/aws-exports';
import { Colors } from 'react-native/Libraries/NewAppScreen';
Amplify.configure(awsExports);

// retrieves only the current value of 'user' from 'useAuthenticator'
const userSelector = (context) => [context.user]

const SignOutButton = () => {
  const { user, signOut } = useAuthenticator(userSelector);
  return (
    <View style={styles.mainContainer}>
    <Image source={require("./assets/img/backgroundHeader.png")} />
    <Pressable onPress={signOut} style={styles.buttonContainer}>
      <Text style={styles.buttonText}>
        Hola, {user.username}! Click Aqui Si Deseas Salir Del Foro De Consultas! 
      </Text>
      <Text style={styles.buttonText}>
        Hola, {user.username}! Aqui Registraras Tu Nombre Y La Molestia Que Tienes! 
      </Text>
    </Pressable>
    </View>
  );
};

const initialFormState = {name: '', description: ''};

const App = () => {
  const [formState, setFormState] = useState(initialFormState);
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    fetchTodos();
  }, []);

  function setInput(key, value) {
    setFormState({...formState, [key]: value});
  }

  async function fetchTodos() {
    try {
      const todoData = await API.graphql(graphqlOperation(listTodos));
      const todos = todoData.data.listTodos.items;
      setTodos(todos);
    } catch (err) {
      console.log('error fetching todos');
    }
  }

  async function addTodo() {
    try {
      if (!formState.name || !formState.description) return;
      const todo = {...formState};
      setTodos([...todos, todo]);
      setFormState(initialFormState);
      await API.graphql(graphqlOperation(createTodo, {input: todo}));
    } catch (err) {
      console.log('error creating todo:', err);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
      <View style={styles.container}>
        <SignOutButton />
        <TextInput
          onChangeText={value => setInput('name', value)}
          style={styles.input}
          value={formState.name}
          placeholder="Nombre Paciente"
        />
        <TextInput
          onChangeText={value => setInput('description', value)}
          style={styles.input}
          value={formState.description}
          placeholder="Describe tus sintomas"
        />
        <Pressable onPress={addTodo} style={styles.buttonContainer}>
          <Text style={styles.buttonText}>Registrar Caso</Text>
        </Pressable>
        {todos.map((todo, index) => (
          <View key={todo.id ? todo.id : index} style={styles.todo}>
            <Text style={styles.todoName}>{todo.name}</Text>
            <Text style={styles.todoDescription}>{todo.description}</Text>
          </View>
        ))}
      </View>
        
      </ScrollView>
     
    </SafeAreaView>
  );
};

export default withAuthenticator(App);

const styles = StyleSheet.create({
  container: {width: 400, flex: 1, padding: 20, alignSelf: 'center'},
  todo: {marginBottom: 15},
  input: {backgroundColor: '#ddd', marginBottom: 10, padding: 8, fontSize: 18, margin: 10},
  todoName: {fontSize: 20, fontWeight: 'bold'},
  buttonContainer: {
    alignSelf: 'center',
    backgroundColor: '#68B6FF',
    paddingHorizontal: 8,
    marginTop: 5
  },
  buttonText: {color: 'white', padding: 10, fontSize: 15, },
});