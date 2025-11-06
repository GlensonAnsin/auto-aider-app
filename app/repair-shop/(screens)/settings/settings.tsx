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
import { deleteAccountRS, updateMapTypeRS, updatePushNotifRS } from '@/services/backendApi';
import socket from '@/services/socket';
import { clearRole, clearTokens } from '@/services/tokenStorage';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
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
  const backRoute = useBackRoute('/repair-shop/(screens)/settings/settings');
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
  const shopID = useSelector((state: RootState) => state.role.ID);
  const deleteAcc = 'deletemyaccount';

  useEffect(() => {
    setIsOn(pushNotif ?? true);
  }, [pushNotif]);

  useEffect(() => {
    if (!socket) return;

    socket.on(`updatedMapType-RS-${shopID}`, ({ mapType }) => {
      dispatch(
        setSettingsState({
          mapType: mapType,
          pushNotif: pushNotif ?? true,
        })
      );
    });

    socket.on(`updatedPushNotif-RS-${shopID}`, ({ updatedPushNotif }) => {
      dispatch(
        setSettingsState({
          mapType: mapType ?? 'standard',
          pushNotif: updatedPushNotif,
        })
      );
    });

    return () => {
      socket.off(`updatedMapType-RS-${shopID}`);
      socket.off(`updatedPushNotif-RS-${shopID}`);
    };
  }, [dispatch, mapType, pushNotif, shopID]);

  const toggleSwitch = async () => {
    setIsOn((previousState) => !previousState);

    try {
      await updatePushNotifRS(isOn);
    } catch {
      showMessage({
        message: 'Something went wrong. Please try again.',
        type: 'danger',
        floating: true,
        color: '#FFF',
        icon: 'danger',
      });
      setTimeout(() => {
        router.push('/error/server-error');
      }, 2000);
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

      await updateMapTypeRS(type);
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
      setTimeout(() => {
        router.push('/error/server-error');
      }, 2000);
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
      await deleteAccountRS();
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
      setTimeout(() => {
        router.push('/error/server-error');
      }, 2000);
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
          <View style={styles.sectionHeader}>
            <View style={styles.labelContainer}>
              <MaterialCommunityIcons name="cog-outline" size={20} color="#000B58" />
              <Text style={styles.label}>Preferences</Text>
            </View>
          </View>

          <View style={styles.settingsCard}>
            <TouchableOpacity style={styles.settingsButton} onPress={() => setMapTypeModalVisible(true)}>
              <View style={styles.settingItemLeft}>
                <View style={styles.settingIconContainer}>
                  <MaterialCommunityIcons name="map-outline" size={22} color="#000B58" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingsButtonText}>Map Type</Text>
                  <Text style={styles.settingSubtext}>
                    {mapType === 'standard' ? 'Standard' : mapType === 'terrain' ? 'Terrain' : 'Hybrid'}
                  </Text>
                </View>
              </View>
              <MaterialIcons name="keyboard-arrow-right" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.sectionHeader}>
            <View style={styles.labelContainer}>
              <MaterialCommunityIcons name="bell-outline" size={20} color="#000B58" />
              <Text style={styles.label}>Notifications</Text>
            </View>
          </View>

          <View style={styles.settingsCard}>
            <View style={styles.settingsButton}>
              <View style={styles.settingItemLeft}>
                <View style={styles.settingIconContainer}>
                  <MaterialCommunityIcons name="bell-ring-outline" size={22} color="#000B58" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingsButtonText}>Push Notifications</Text>
                  <Text style={styles.settingSubtext}>{isOn ? 'Enabled' : 'Disabled'}</Text>
                </View>
              </View>
              <Switch
                trackColor={{ false: '#D1D5DB', true: '#000B58' }}
                thumbColor={isOn ? '#FFF' : '#F3F4F6'}
                ios_backgroundColor="#D1D5DB"
                onValueChange={toggleSwitch}
                value={isOn}
              />
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <View style={styles.labelContainer}>
              <MaterialCommunityIcons name="information-outline" size={20} color="#000B58" />
              <Text style={styles.label}>About</Text>
            </View>
          </View>

          <View style={styles.settingsCard}>
            <View style={styles.settingsButton}>
              <View style={styles.settingItemLeft}>
                <View style={styles.settingIconContainer}>
                  <MaterialCommunityIcons name="cellphone-information" size={22} color="#000B58" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingsButtonText}>App Version</Text>
                  <Text style={styles.settingSubtext}>Current version</Text>
                </View>
              </View>
              <View style={styles.versionBadge}>
                <Text style={styles.versionText}>1.0.0-beta.1</Text>
              </View>
            </View>

            <View style={styles.settingDivider} />

            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => {
                router.replace('/repair-shop/(screens)/settings/settings-screens/terms-of-service');
                backRoute();
              }}
            >
              <View style={styles.settingItemLeft}>
                <View style={styles.settingIconContainer}>
                  <MaterialCommunityIcons name="file-document-outline" size={22} color="#000B58" />
                </View>
                <Text style={styles.settingsButtonText}>Terms of Service</Text>
              </View>
              <MaterialIcons name="keyboard-arrow-right" size={24} color="#6B7280" />
            </TouchableOpacity>

            <View style={styles.settingDivider} />

            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => {
                router.replace('/repair-shop/(screens)/settings/settings-screens/privacy-policy');
                backRoute();
              }}
            >
              <View style={styles.settingItemLeft}>
                <View style={styles.settingIconContainer}>
                  <MaterialCommunityIcons name="shield-lock-outline" size={22} color="#000B58" />
                </View>
                <Text style={styles.settingsButtonText}>Privacy Policy</Text>
              </View>
              <MaterialIcons name="keyboard-arrow-right" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.sectionHeader}>
            <View style={styles.labelContainer}>
              <MaterialCommunityIcons name="account-outline" size={20} color="#DC2626" />
              <Text style={[styles.label, { color: '#DC2626' }]}>Account</Text>
            </View>
          </View>

          <View style={styles.settingsCard}>
            <TouchableOpacity style={styles.settingsButton} onPress={() => setDeleteAccModalVisible(true)}>
              <View style={styles.settingItemLeft}>
                <View style={[styles.settingIconContainer, styles.dangerIconContainer]}>
                  <MaterialCommunityIcons name="delete-forever-outline" size={22} color="#DC2626" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingsButtonText, { color: '#DC2626' }]}>Delete Account</Text>
                  <Text style={styles.settingSubtextDanger}>Permanently remove your account</Text>
                </View>
              </View>
              <MaterialIcons name="keyboard-arrow-right" size={24} color="#DC2626" />
            </TouchableOpacity>
          </View>
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
              <View style={styles.modalHeaderContainer}>
                <MaterialCommunityIcons name="map-check" size={32} color="#000B58" />
                <Text style={styles.modalHeader}>Choose Map Type</Text>
                <Text style={styles.modalSubtext}>Select your preferred map display style</Text>
              </View>

              <View style={styles.mapTypeOptionsContainer}>
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
                        borderWidth: mapType === 'standard' ? 3 : 0,
                        borderColor: mapType === 'standard' ? '#000B58' : 'transparent',
                      },
                    ]}
                    onPress={() => handleUpdateMapType('standard')}
                  >
                    <Text style={styles.mapTypeText}>
                      {updateLoadingStandard ? <ActivityIndicator size="small" color="#FFF" /> : <Text>Standard</Text>}
                    </Text>
                    {mapType === 'standard' && (
                      <View style={styles.selectedBadge}>
                        <MaterialCommunityIcons name="check-circle" size={20} color="#000B58" />
                      </View>
                    )}
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
                        borderWidth: mapType === 'terrain' ? 3 : 0,
                        borderColor: mapType === 'terrain' ? '#000B58' : 'transparent',
                      },
                    ]}
                    onPress={() => handleUpdateMapType('terrain')}
                  >
                    <Text style={styles.mapTypeText}>
                      {updateLoadingTerrain ? <ActivityIndicator size="small" color="#FFF" /> : <Text>Terrain</Text>}
                    </Text>
                    {mapType === 'terrain' && (
                      <View style={styles.selectedBadge}>
                        <MaterialCommunityIcons name="check-circle" size={20} color="#000B58" />
                      </View>
                    )}
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
                        borderWidth: mapType === 'hybrid' ? 3 : 0,
                        borderColor: mapType === 'hybrid' ? '#000B58' : 'transparent',
                      },
                    ]}
                    onPress={() => handleUpdateMapType('hybrid')}
                  >
                    <Text style={styles.mapTypeText}>
                      {updateLoadingHybrid ? <ActivityIndicator size="small" color="#FFF" /> : <Text>Hybrid</Text>}
                    </Text>
                    {mapType === 'hybrid' && (
                      <View style={styles.selectedBadge}>
                        <MaterialCommunityIcons name="check-circle" size={20} color="#000B58" />
                      </View>
                    )}
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
              <View style={styles.deleteModalHeader}>
                <View style={styles.dangerIconCircle}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#DC2626" />
                </View>
                <Text style={styles.modalHeader}>Delete Account</Text>
                <Text style={styles.modalSubtext}>This action cannot be undone</Text>
              </View>

              <View style={styles.deleteWarningBox}>
                <MaterialCommunityIcons name="information-outline" size={20} color="#DC2626" />
                <Text style={styles.deleteWarningText}>
                  All your data, shop information, and request history will be permanently deleted
                </Text>
              </View>

              <View style={styles.deleteInputContainer}>
                <Text style={styles.text}>
                  To confirm, type <Text style={styles.deleteConfirmText}>&quot;deletemyaccount&quot;</Text> below:
                </Text>
                <TextInput
                  value={deleteConfirmation}
                  onChangeText={setDeleteConfirmation}
                  style={styles.deleteAccInput}
                  placeholder="Type here..."
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.deleteModalActions}>
                <TouchableOpacity
                  style={styles.cancelDeleteButton}
                  onPress={() => {
                    setDeleteAccModalVisible(false);
                    setDeleteConfirmation('');
                  }}
                >
                  <Text style={styles.cancelDeleteText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.deleteButton, deleteLoading && styles.deleteButtonDisabled]}
                  onPress={() => handleDeleteAccount()}
                  disabled={deleteLoading}
                >
                  <View style={styles.deleteButtonContent}>
                    {deleteLoading && <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />}
                    <MaterialCommunityIcons name="delete-forever" size={18} color="#FFF" />
                    <Text style={[styles.settingsButtonText, { color: '#fff' }]}>
                      {deleteLoading ? 'Deleting...' : 'Delete'}
                    </Text>
                  </View>
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
  sectionHeader: {
    marginTop: 20,
    marginBottom: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  label: {
    fontFamily: 'BodyBold',
    color: '#000B58',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingsButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingIconContainer: {
    backgroundColor: '#E0E7FF',
    borderRadius: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dangerIconContainer: {
    backgroundColor: '#FEE2E2',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingsButtonText: {
    fontFamily: 'BodyBold',
    color: '#111827',
    fontSize: 15,
  },
  settingSubtext: {
    fontFamily: 'BodyRegular',
    color: '#6B7280',
    fontSize: 13,
    marginTop: 2,
  },
  settingSubtextDanger: {
    fontFamily: 'BodyRegular',
    color: '#DC2626',
    fontSize: 13,
    marginTop: 2,
  },
  settingDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 68,
  },
  versionBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  versionText: {
    fontFamily: 'BodyBold',
    color: '#6B7280',
    fontSize: 12,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeaderContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    fontSize: 22,
    fontFamily: 'HeaderBold',
    color: '#111827',
    marginTop: 12,
    marginBottom: 4,
  },
  modalSubtext: {
    fontFamily: 'BodyRegular',
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
  },
  mapTypeOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
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
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  mapTypeImage: {
    width: 150,
    height: 150,
    borderRadius: 20,
  },
  mapTypeText: {
    position: 'absolute',
    bottom: 8,
    fontFamily: 'BodyBold',
    color: '#fff',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 2,
  },
  deleteModalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  dangerIconCircle: {
    backgroundColor: '#FEE2E2',
    borderRadius: 60,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteWarningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  deleteWarningText: {
    fontFamily: 'BodyRegular',
    color: '#DC2626',
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  deleteInputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  deleteConfirmText: {
    fontFamily: 'BodyBold',
    color: '#DC2626',
  },
  deleteAccInput: {
    backgroundColor: '#F9FAFB',
    width: '100%',
    borderRadius: 10,
    fontFamily: 'BodyRegular',
    color: '#111827',
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    fontSize: 15,
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelDeleteButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  cancelDeleteText: {
    fontFamily: 'BodyBold',
    color: '#6B7280',
    fontSize: 15,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  deleteButtonDisabled: {
    opacity: 0.6,
    backgroundColor: '#9CA3AF',
  },
  deleteButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  text: {
    fontFamily: 'BodyRegular',
    color: '#374151',
    fontSize: 14,
  },
});

export default Settings;
