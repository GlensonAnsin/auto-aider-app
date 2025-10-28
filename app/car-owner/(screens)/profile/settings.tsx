import { Header } from '@/components/Header';
import { useBackRoute } from '@/hooks/useBackRoute';
import { RootState } from '@/redux/store';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

const Settings = () => {
  const backRoute = useBackRoute('/car-owner/profile/settings');
  const router = useRouter();
  const [isOn, setIsOn] = useState<boolean>(false);
  const [mapTypeModalVisible, setMapTypeModalVisible] = useState<boolean>(false);
  const mapType = useSelector((state: RootState) => state.settings.mapType);

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
          <TouchableOpacity style={styles.settingsButton} onPress={() => setMapTypeModalVisible(true)}>
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
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => {
              router.replace('/car-owner/profile/settings-screens/terms-of-service');
              backRoute();
            }}
          >
            <Text style={styles.settingsButtonText}>Terms of Service</Text>
            <MaterialIcons name="keyboard-arrow-right" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => {
              router.replace('/car-owner/profile/settings-screens/privacy-policy');
              backRoute();
            }}
          >
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

      <Modal
        animationType="fade"
        backdropColor={'rgba(0, 0, 0, 0.5)'}
        visible={mapTypeModalVisible}
        onRequestClose={() => setMapTypeModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMapTypeModalVisible(false)}>
          <View style={styles.centeredView}>
            <Pressable style={styles.modalView} onPress={() => {}}>
              <View style={styles.mapTypeContainer}>
                <View style={styles.mapTypeView}>
                  <Image
                    source={require('../../../../assets/images/standard.jpg')}
                    style={[
                      styles.mapTypeImage,
                      { width: mapType === 'standard' ? 170 : 150, height: mapType === 'standard' ? 170 : 150 },
                    ]}
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.mapTypeButton,
                    {
                      width: mapType === 'standard' ? 170 : 150,
                      height: mapType === 'standard' ? 170 : 150,
                      borderWidth: mapType === 'standard' ? 2 : 0,
                      borderColor: mapType === 'standard' ? '#000B58' : '',
                    },
                  ]}
                >
                  <Text style={styles.mapTypeText}>Standard</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.mapTypeContainer}>
                <View style={styles.mapTypeView}>
                  <Image
                    source={require('../../../../assets/images/terrain.jpg')}
                    style={[
                      styles.mapTypeImage,
                      { width: mapType === 'terrain' ? 170 : 150, height: mapType === 'terrain' ? 170 : 150 },
                    ]}
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.mapTypeButton,
                    {
                      width: mapType === 'terrain' ? 170 : 150,
                      height: mapType === 'terrain' ? 170 : 150,
                      borderWidth: mapType === 'terrain' ? 2 : 0,
                      borderColor: mapType === 'terrain' ? '#000B58' : '',
                    },
                  ]}
                >
                  <Text style={styles.mapTypeText}>Terrain</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.mapTypeContainer}>
                <View style={styles.mapTypeView}>
                  <Image
                    source={require('../../../../assets/images/hybrid.jpg')}
                    style={[
                      styles.mapTypeImage,
                      { width: mapType === 'hybrid' ? 170 : 150, height: mapType === 'hybrid' ? 170 : 150 },
                    ]}
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.mapTypeButton,
                    {
                      width: mapType === 'hybrid' ? 170 : 150,
                      height: mapType === 'hybrid' ? 170 : 150,
                      borderWidth: mapType === 'hybrid' ? 2 : 0,
                      borderColor: mapType === 'hybrid' ? '#000B58' : '',
                    },
                  ]}
                >
                  <Text style={styles.mapTypeText}>Hybrid</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f7',
  },
  lowerBox: {
    flex: 1,
    marginBottom: 80,
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
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  settingsButtonText: {
    fontFamily: 'BodyRegular',
    color: '#333',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: '#f2f4f7',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 10,
  },
  mapTypeContainer: {
    position: 'relative',
  },
  mapTypeView: {
    position: 'absolute',
    zIndex: 1,
    borderRadius: 20,
  },
  mapTypeButton: {
    width: 150,
    height: 150,
    zIndex: 2,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  mapTypeImage: {
    width: 150,
    height: 150,
    borderRadius: 20,
  },
  mapTypeText: {
    position: 'absolute',
    fontFamily: 'BodyRegular',
    color: '#fff',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 5,
    width: '100%',
    textAlign: 'center',
  },
});

export default Settings;
