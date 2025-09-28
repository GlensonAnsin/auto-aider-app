import { Header } from '@/components/Header';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Settings = () => {
  const [isOn, setIsOn] = useState<boolean>(false);

  const toggleSwitch = async () => {
    setIsOn((previousState) => !previousState);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header headerTitle="Settings" />
      <ScrollView>
        <View style={styles.lowerBox}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>Preferences</Text>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Text style={styles.settingsButtonText}>Map Type</Text>
            <MaterialIcons name="keyboard-arrow-right" size={24} color="#333" />
          </TouchableOpacity>

          <View style={styles.labelContainer}>
            <Text style={styles.label}>Notifications</Text>
          </View>
          <View style={styles.settingsButton}>
            <Text style={styles.settingsButtonText}>Push Notifications</Text>
            <Switch
              trackColor={{ false: '#767577', true: '#000B58' }}
              thumbColor={isOn ? '#EEE' : '#DDD'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSwitch}
              value={isOn}
            />
          </View>

          <View style={styles.labelContainer}>
            <Text style={styles.label}>Support & Feedback</Text>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Text style={styles.settingsButtonText}>Help/FAQs</Text>
            <MaterialIcons name="keyboard-arrow-right" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsButton}>
            <Text style={styles.settingsButtonText}>Contact Support</Text>
            <MaterialIcons name="keyboard-arrow-right" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsButton}>
            <Text style={styles.settingsButtonText}>Report a Bug</Text>
            <MaterialIcons name="keyboard-arrow-right" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsButton}>
            <Text style={styles.settingsButtonText}>Rate the App</Text>
            <MaterialIcons name="keyboard-arrow-right" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsButton}>
            <Text style={styles.settingsButtonText}>Feedback</Text>
            <MaterialIcons name="keyboard-arrow-right" size={24} color="#333" />
          </TouchableOpacity>

          <View style={styles.labelContainer}>
            <Text style={styles.label}>About</Text>
          </View>
          <View style={styles.settingsButton}>
            <Text style={styles.settingsButtonText}>App Version</Text>
            <Text style={styles.settingsButtonText}>1.0.0</Text>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Text style={styles.settingsButtonText}>Terms of Service</Text>
            <MaterialIcons name="keyboard-arrow-right" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsButton}>
            <Text style={styles.settingsButtonText}>Privacy Policy</Text>
            <MaterialIcons name="keyboard-arrow-right" size={24} color="#333" />
          </TouchableOpacity>

          <View style={styles.labelContainer}>
            <Text style={styles.label}>Account</Text>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Text style={[styles.settingsButtonText, { color: '#780606' }]}>Delete Account</Text>
            <MaterialIcons name="keyboard-arrow-right" size={24} color="#780606" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  lowerBox: {
    flex: 1,
    marginBottom: 100,
  },
  labelContainer: {
    padding: 10,
  },
  label: {
    fontFamily: 'BodyRegular',
    color: '#333',
    fontSize: 16,
  },
  settingsButton: {
    backgroundColor: '#EAEAEA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  settingsButtonText: {
    fontFamily: 'BodyRegular',
    color: '#333',
  },
});

export default Settings;
