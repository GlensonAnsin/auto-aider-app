import { Header } from '@/components/Header';
import { useBackRoute } from '@/hooks/useBackRoute';
import { clearRoleState } from '@/redux/slices/roleSlice';
import { clearRouteState } from '@/redux/slices/routeSlice';
import { clearScanReferenceState } from '@/redux/slices/scanReferenceSlice';
import { clearScanState } from '@/redux/slices/scanSlice';
import { clearSenderReceiverState } from '@/redux/slices/senderReceiverSlice';
import { setSettingsState } from '@/redux/slices/settingsSlice';
import { clearVehicleDiagIDArrState } from '@/redux/slices/vehicleDiagIDArrSlice';
import { clearVehicleDiagIDState } from '@/redux/slices/vehicleDiagIDSlice';
import { RootState } from '@/redux/store';
import { deleteAccountCO, updateMapTypeCO, updatePushNotifCO } from '@/services/backendApi';
import socket from '@/services/socket';
import { clearRole, clearTokens } from '@/services/tokenStorage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

const Settings = () => {
  const dispatch = useDispatch();
  const backRoute = useBackRoute('/car-owner/profile/settings');
  const router = useRouter();
  const [isOn, setIsOn] = useState<boolean>(false);
  const [mapTypeModalVisible, setMapTypeModalVisible] = useState<boolean>(false);
  const [updateLoadingStandard, setUpdateLoadingStandard] = useState<boolean>(false);
  const [updateLoadingTerrain, setUpdateLoadingTerrain] = useState<boolean>(false);
  const [updateLoadingHybrid, setUpdateLoadingHybrid] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [deleteAccModalVisible, setDeleteAccModalVisible] = useState<boolean>(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string>('');
  const mapType = useSelector((state: RootState) => state.settings.mapType);
  const pushNotif = useSelector((state: RootState) => state.settings.pushNotif);
  const userID = useSelector((state: RootState) => state.role.ID);
  const deleteAcc = 'deletemyaccount';

  useEffect(() => {
    setIsOn(pushNotif ?? true);
  }, [pushNotif]);

  useEffect(() => {
    if (!socket) return;

    socket.on(`updatedMapType-CO-${userID}`, ({ mapType }) => {
      dispatch(
        setSettingsState({
          mapType: mapType,
          pushNotif: pushNotif ?? true,
        })
      );
    });

    socket.on(`updatedPushNotif-CO-${userID}`, ({ updatedPushNotif }) => {
      dispatch(
        setSettingsState({
          mapType: mapType ?? 'standard',
          pushNotif: updatedPushNotif,
        })
      );
    });

    return () => {
      socket.off(`updatedMapType-CO-${userID}`);
      socket.off(`updatedPushNotif-CO-${userID}`);
    };
  }, [dispatch, mapType, pushNotif, userID]);

  const toggleSwitch = async () => {
    setIsOn((previousState) => !previousState);

    try {
      await updatePushNotifCO(isOn);
    } catch {
      showMessage({
        message: 'Something went wrong. Please try again.',
        type: 'danger',
        floating: true,
        color: '#FFF',
        icon: 'danger',
      });
    }
  };

  const handleUpdateMapType = async (type: string) => {
    if (mapType === type) return;

    try {
      if (type === 'standard') {
        setUpdateLoadingStandard(true);
      } else if (type === 'terrain') {
        setUpdateLoadingTerrain(true);
      } else {
        setUpdateLoadingHybrid(true);
      }

      await updateMapTypeCO(type);
      showMessage({
        message: 'Map type changed!',
        type: 'success',
        floating: true,
        color: '#FFF',
        icon: 'success',
      });
    } catch {
      showMessage({
        message: 'Something went wrong. Please try again.',
        type: 'danger',
        floating: true,
        color: '#FFF',
        icon: 'danger',
      });
    } finally {
      if (type === 'standard') {
        setUpdateLoadingStandard(false);
      } else if (type === 'terrain') {
        setUpdateLoadingTerrain(false);
      } else {
        setUpdateLoadingHybrid(false);
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteLoading) return; // Prevent multiple clicks

    if (deleteConfirmation !== deleteAcc) {
      showMessage({
        message: 'Confirmation did not match.',
        type: 'warning',
        floating: true,
        color: '#FFF',
        icon: 'warning',
      });
      setDeleteAccModalVisible(false);
      setDeleteConfirmation('');
      return;
    }

    setDeleteLoading(true);
    try {
      await deleteAccountCO();
      await clearTokens();
      await clearRole();
      dispatch(clearRoleState());
      dispatch(clearRouteState());
      dispatch(clearScanState());
      dispatch(clearScanReferenceState());
      dispatch(clearSenderReceiverState());
      dispatch(clearVehicleDiagIDArrState());
      dispatch(clearVehicleDiagIDState());
      router.replace('/auth/login');
    } catch {
      showMessage({
        message: 'Something went wrong. Please try again.',
        type: 'danger',
        floating: true,
        color: '#FFF',
        icon: 'danger',
      });
    } finally {
      setDeleteLoading(false);
      setDeleteAccModalVisible(false);
      setDeleteConfirmation('');
    }
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
            <Text style={styles.label}>About</Text>
          </View>
          <View style={styles.settingsButton}>
            <Text style={styles.settingsButtonText}>App Version</Text>
            <Text style={styles.settingsButtonText}>1.0.0-beta.1</Text>
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
          <TouchableOpacity style={styles.settingsButton} onPress={() => setDeleteAccModalVisible(true)}>
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
              <Text style={styles.modalHeader}>Map Type</Text>
              <View
                style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 10 }}
              >
                <View style={styles.mapTypeContainer}>
                  <View style={styles.mapTypeView}>
                    <Image
                      source={require('../../../../assets/images/standard.jpg')}
                      style={[
                        styles.mapTypeImage,
                        { width: mapType === 'standard' ? 100 : 80, height: mapType === 'standard' ? 100 : 80 },
                      ]}
                    />
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.mapTypeButton,
                      {
                        width: mapType === 'standard' ? 100 : 80,
                        height: mapType === 'standard' ? 100 : 80,
                        borderWidth: mapType === 'standard' ? 2 : 0,
                        borderColor: mapType === 'standard' ? '#000B58' : '',
                      },
                    ]}
                    onPress={() => handleUpdateMapType('standard')}
                  >
                    <Text style={styles.mapTypeText}>
                      {updateLoadingStandard ? (
                        <ActivityIndicator size="small" color="#000B58" />
                      ) : (
                        <Text>Standard</Text>
                      )}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.mapTypeContainer}>
                  <View style={styles.mapTypeView}>
                    <Image
                      source={require('../../../../assets/images/terrain.jpg')}
                      style={[
                        styles.mapTypeImage,
                        { width: mapType === 'terrain' ? 100 : 80, height: mapType === 'terrain' ? 100 : 80 },
                      ]}
                    />
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.mapTypeButton,
                      {
                        width: mapType === 'terrain' ? 100 : 80,
                        height: mapType === 'terrain' ? 100 : 80,
                        borderWidth: mapType === 'terrain' ? 2 : 0,
                        borderColor: mapType === 'terrain' ? '#000B58' : '',
                      },
                    ]}
                    onPress={() => handleUpdateMapType('terrain')}
                  >
                    <Text style={styles.mapTypeText}>
                      {updateLoadingTerrain ? <ActivityIndicator size="small" color="#000B58" /> : <Text>Terrain</Text>}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.mapTypeContainer}>
                  <View style={styles.mapTypeView}>
                    <Image
                      source={require('../../../../assets/images/hybrid.jpg')}
                      style={[
                        styles.mapTypeImage,
                        { width: mapType === 'hybrid' ? 100 : 80, height: mapType === 'hybrid' ? 100 : 80 },
                      ]}
                    />
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.mapTypeButton,
                      {
                        width: mapType === 'hybrid' ? 100 : 80,
                        height: mapType === 'hybrid' ? 100 : 80,
                        borderWidth: mapType === 'hybrid' ? 2 : 0,
                        borderColor: mapType === 'hybrid' ? '#000B58' : '',
                      },
                    ]}
                    onPress={() => handleUpdateMapType('hybrid')}
                  >
                    <Text style={styles.mapTypeText}>
                      {updateLoadingHybrid ? <ActivityIndicator size="small" color="#000B58" /> : <Text>Hybrid</Text>}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Pressable>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        animationType="fade"
        backdropColor={'rgba(0, 0, 0, 0.5)'}
        visible={deleteAccModalVisible}
        onRequestClose={() => {
          setDeleteAccModalVisible(false);
          setDeleteConfirmation('');
        }}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            setDeleteAccModalVisible(false);
            setDeleteConfirmation('');
          }}
        >
          <View style={styles.centeredView}>
            <Pressable style={[styles.modalView, { width: '90%' }]} onPress={() => {}}>
              <Text style={styles.modalHeader}>Delete Account</Text>
              <Text style={styles.text}>To confirm, type &quot;deletemyaccount&quot; in the box below</Text>
              <TextInput
                value={deleteConfirmation}
                onChangeText={setDeleteConfirmation}
                style={styles.deleteAccInput}
              />
              <TouchableOpacity
                style={[styles.deleteButton, deleteLoading && styles.deleteButtonDisabled]}
                onPress={() => handleDeleteAccount()}
                disabled={deleteLoading}
              >
                <View style={styles.deleteButtonContent}>
                  {deleteLoading && <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />}
                  <Text style={[styles.settingsButtonText, { color: '#fff' }]}>
                    {deleteLoading ? 'Deleting...' : 'Delete'}
                  </Text>
                </View>
              </TouchableOpacity>
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
  },
  modalHeader: {
    fontSize: 20,
    fontFamily: 'HeaderBold',
    color: '#333',
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
  deleteButton: {
    backgroundColor: '#780606',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    width: 100,
    borderRadius: 10,
    marginTop: 10,
  },
  deleteButtonDisabled: {
    opacity: 0.6,
    backgroundColor: '#cccccc',
  },
  deleteButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteAccInput: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 10,
    fontFamily: 'BodyRegular',
    color: '#333',
    marginTop: 10,
  },
  text: {
    fontFamily: 'BodyRegular',
    color: '#333',
  },
});

export default Settings;
