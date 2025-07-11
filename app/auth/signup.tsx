import { createRepairShop, createUser, getRepairShops, getUsers } from '@/services/backendApi';
import { AutoRepairShop } from '@/types/autoRepairShop';
import { User } from '@/types/user';
import Checkbox from 'expo-checkbox';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { showMessage } from "react-native-flash-message";
import MapView, { Marker, Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import SelectDropdown from 'react-native-select-dropdown';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Signup = () => {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  const [firstname, setFirstname] = useState<string>('');
  const [lastname, setLastname] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [mobileNum, setMobileNum] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [shopName, setShopName] = useState<string>('');
  const [page, setPage] = useState<string>('');
  const [region, setRegion] = useState<Region | undefined>(undefined);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [carOwnerModalVisible, isCarOwnerModalVisible] = useState<boolean>(false);
  const [repairShopModalVisible, isRepairShopModalVisible] = useState<boolean>(false);

  const roles = [
    { title: 'Car Owner', icon: 'car-outline' },
    { title: 'Repair Shop', icon: 'tools' },
  ];
  const genders = [
    { title: 'Male', icon: 'gender-male' },
    { title: 'Female', icon: 'gender-female' },
  ];
  const services = [
    { id: '1', label: 'Engine diagnostics and repair' },
    { id: '2', label: 'Transmission repair and overhaul' },
    { id: '3', label: 'Oil change and fluid replacement (engine oil, brake fluid, coolant, etc.)' },
    { id: '4', label: 'Brake system service (pads, discs, drums, ABS systems)' },
    { id: '5', label: 'Clutch system service' },
    { id: '6', label: 'Battery check and replacement' },
    { id: '7', label: 'Timing belt/chain replacement' },
    { id: '8', label: 'Alternator and starter motor repair' },
    { id: '9', label: 'Suspension and steering repair' },
    { id: '10', label: 'Wheel alignment and balancing' },
    { id: '11', label: 'Shock absorber and strut replacement' },
    { id: '12', label: 'CV joint and axle repair' },
    { id: '13', label: 'Radiator repair and replacement' },
    { id: '14', label: 'Fuel system service (cleaning, injector repair)' },
    { id: '15', label: 'Air conditioning system service and repair' },
    { id: '16', label: 'Computerized engine diagnostics (OBD scanning)' },
    { id: '17', label: 'Wiring and electrical system repair' },
    { id: '18', label: 'ECU reprogramming' },
    { id: '19', label: 'Sensor and fuse replacement' },
    { id: '20', label: 'Headlight, taillight, and signal light repairs' },
    { id: '21', label: 'Power window and central lock repair' },
    { id: '22', label: 'Dent removal (Paintless Dent Removal)' },
    { id: '23', label: 'Auto body repair and repainting' },
    { id: '24', label: 'Collision repair' },
    { id: '25', label: 'Rustproofing and undercoating' },
    { id: '26', label: 'Car detailing and polishing' },
    { id: '27', label: 'Headlight restoration' },
    { id: '28', label: 'Full car wash (interior and exterior)' },
    { id: '29', label: 'Engine wash' },
    { id: '30', label: 'Interior vacuuming and shampooing' },
    { id: '31', label: 'Ceramic coating or wax application' },
    { id: '32', label: 'Upholstery and leather care' },
    { id: '33', label: 'Tire replacement and sales' },
    { id: '34', label: 'Brake pads, rotors, and linings' },
    { id: '35', label: 'Filters (air, fuel, oil, cabin)' },
    { id: '36', label: 'Belts and hoses' },
    { id: '37', label: 'Spark plugs and ignition coils' },
    { id: '38', label: 'Accessories (car alarms, dashcams, LED lights, spoilers, etc.)' },
    { id: '39', label: 'Preventive maintenance service (PMS)' },
    { id: '40', label: 'LTO vehicle inspection assistance' },
    { id: '41', label: 'Emission testing assistance' },
    { id: '42', label: 'Vehicle pre-buy inspection' },
    { id: '43', label: 'Insurance claim estimates and repairs' },
    { id: '44', label: '24/7 towing service' },
    { id: '45', label: 'Roadside assistance' },
    { id: '46', label: 'Fleet maintenance (for companies with multiple vehicles)' },
    { id: '47', label: 'Car restoration (classic or vintage cars)' },
    { id: '48', label: 'Custom modifications and tuning' },
  ];

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  const handleDrag = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;

    const newRegion: Region = {
      ...region!,
      latitude,
      longitude,
    };
    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 300);
  };

  const toggleCheckbox = (id: string) => {
    setSelectedServices(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const getRandomHexColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  const handleAddUser = async () => {
    if (!firstname || !lastname || !gender || !mobileNum || !password || !confirmPassword || !role) {
      showMessage({
        message: 'Please fill in all fields.',
        type: 'warning',
        floating: true,
        color: '#FFF',
        icon: 'warning',
      });
      return;
    }

    if (password !== confirmPassword) {
      showMessage({
        message: "Password don't match.",
        type: 'warning',
        floating: true,
        color: '#FFF',
        icon: 'warning',
      });
      return;
    }

    if (password.length < 8) {
      showMessage({
        message: "Password must be at least 8 characters.",
        type: 'warning',
        floating: true,
        color: '#FFF',
        icon: 'warning',
      });
      return;
    }

    try {
      const fetchedUsers: User[] = await getUsers();
      const mobileNumExists = fetchedUsers.some(user => user.mobile_num === mobileNum.trim());

      if (mobileNumExists) {
        showMessage({
          message: 'Mobile number is already used by another account.',
          type: 'warning',
          floating: true,
          color: '#FFF',
          icon: 'warning',
        });
        return;
      }

    } catch (e) {
      showMessage({
        message: 'Something went wrong. Please try again.',
        type: 'danger',
        floating: true,
        color: '#FFF',
        icon: 'danger',
      });
      return;
    }

    const newUser = {
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      gender: gender.trim(),
      email: null,
      mobile_num: mobileNum.trim(),
      password: password.trim(),
      creation_date: new Date(),
      profile_pic: null,
      role: role.trim(),
      user_initials_bg: getRandomHexColor()
    };

    try {
      await createUser(newUser);
      setFirstname('');
      setLastname('');
      setGender('');
      setMobileNum('');
      setPassword('');
      setConfirmPassword('');
      isCarOwnerModalVisible(true);

    } catch (e) {
      showMessage({
        message: 'Something went wrong. Please try again.',
        type: 'danger',
        floating: true,
        color: '#FFF',
        icon: 'danger',
      });
    }
  };

  const handleAddRepairShop = async () => {
    if (page === 'Repair Shop') {
      if (!firstname || !lastname || !gender || !mobileNum || !password || !confirmPassword || !shopName || !role) {
        showMessage({
          message: 'Please fill in all fields.',
          type: 'warning',
          floating: true,
          color: '#FFF',
          icon: 'warning',
        });
        return;
      }
      
      if (password !== confirmPassword) {
        showMessage({
          message: "Password don't match.",
          type: 'warning',
          floating: true,
          color: '#FFF',
          icon: 'warning',
        });
        return;
      }

      if (password.length < 8) {
        showMessage({
          message: "Password must be at least 8 characters.",
          type: 'warning',
          floating: true,
          color: '#FFF',
          icon: 'warning',
        });
        return;
      }

      try {
        const fetchedAutoRepairShops: AutoRepairShop[] = await getRepairShops();
        const mobileNumExists = fetchedAutoRepairShops.some(repairShop => repairShop.mobile_num === mobileNum.trim());

        if (mobileNumExists) {
          showMessage({
            message: 'Mobile number is already used by another account.',
            type: 'warning',
            floating: true,
            color: '#FFF',
            icon: 'warning',
          });
          return;
        }

      } catch (e) {
        showMessage({
          message: 'Something went wrong. Please try again.',
          type: 'danger',
          floating: true,
          color: '#FFF',
          icon: 'danger',
        });
      }
      
      setPage('Location');

    } else if (page === 'Location') {
      setPage('Services Offered');

    } else {
      if (selectedServices.length === 0) {
        showMessage({
          message: 'Please select your services oferred.',
          type: 'warning',
          floating: true,
          color: '#FFF',
          icon: 'warning',
        });
        return;
      }

      const newRepairShop = {
        repair_shop_id: null,
        owner_firstname: firstname.trim(),
        owner_lastname: lastname.trim(),
        gender: gender.trim(),
        shop_name: shopName.trim(),
        mobile_num: mobileNum.trim(),
        password: password.trim(),
        email: null,
        services_offered: selectedServices,
        longitude: region?.longitude !== undefined ? region.longitude.toString() : '',
        latitude: region?.latitude !== undefined ? region.latitude.toString() : '',
        creation_date: null,
        profile_pic: null,
        shop_images: null,
        number_of_ratings: 0,
        average_rating: 0,
        approval_status: 'Pending',
        total_score: 0
      };

      try {
        await createRepairShop(newRepairShop);
        setFirstname('');
        setLastname('');
        setGender('');
        setShopName('');
        setMobileNum('');
        setPassword('');
        setConfirmPassword('');
        setSelectedServices([]);
        setRegion(undefined);
        isRepairShopModalVisible(true);
        
      } catch (e) {
        showMessage({
          message: 'Something went wrong. Please try again.',
          type: 'danger',
          floating: true,
          color: '#FFF',
          icon: 'danger',
        });
      }
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior='padding'
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps='handled' 
        >
          <View style={styles.upperBox}>
            <Text style={styles.welcomeTxt}>Welcome To</Text>
            <Image 
              source={require('../../assets/images/logo.png')}
            />

            <View style={styles.textInputContainer1}>
              <Text style={styles.upperTextInputLbl}>Register as</Text>
              <SelectDropdown
                data={roles}
                onSelect={(selectedItem) => {
                  setRole(selectedItem.title);
                  setPage(selectedItem.title);
                  setFirstname('');
                  setLastname('');
                  setGender('');
                  setMobileNum('');
                  setPassword('');
                  setConfirmPassword('');
                  setSelectedServices([]);
                  setRegion(undefined);
                  setShopName('');
                }}
                renderButton={(selectedItem, isOpen) => (
                  <View style={styles.upperDropdownButtonStyle}>
                    {selectedItem && <Icon name={selectedItem.icon} style={styles.dropdownButtonIconStyle} />}
                    <Text style={styles.dropdownButtonTxtStyle}>
                      {(selectedItem && selectedItem.title) || 'Select role'}
                    </Text>
                    <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} style={styles.dropdownButtonArrowStyle} />
                  </View>
                )}
                renderItem={(item, _index, isSelected) => (
                  <View
                    style={{
                      ...styles.dropdownItemStyle,
                      ...(isSelected && { backgroundColor: '#D2D9DF' }),
                    }}
                  >
                    <Icon name={item.icon} style={styles.dropdownItemIconStyle} />
                    <Text style={styles.dropdownItemTxtStyle}>{item.title}</Text>
                  </View>
                )}
                showsVerticalScrollIndicator={false}
                dropdownStyle={styles.dropdownMenuStyle}
              />
            </View>
          </View>

          <View style={styles.lowerBox}>
            {page === 'Car Owner' && (
              <>
                <TouchableOpacity style={styles.arrowWrapper} onPress={() => router.push('/auth/login')}>
                  <Icon name='arrow-left' style={styles.arrowBack} />
                </TouchableOpacity>

                <Text style={styles.header}>Create Account</Text>
                <View style={styles.row}>
                  <View style={styles.textInputContainer2}>
                    <Text style={styles.textInputLbl}>First Name</Text>
                    <TextInput
                      value={firstname}
                      onChangeText={setFirstname}
                      style={styles.input}
                    />
                  </View>

                  <View style={styles.textInputContainer2}>
                    <Text style={styles.textInputLbl}>Last Name</Text>
                    <TextInput
                      value={lastname}
                      onChangeText={setLastname}
                      style={styles.input}
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.textInputContainer2}>
                    <Text style={styles.textInputLbl}>Gender</Text>
                    <SelectDropdown
                      data={genders}
                      onSelect={(selectedItem) => setGender(selectedItem.title)}
                      renderButton={(selectedItem, isOpen) => (
                        <View style={styles.dropdownButtonStyle}>
                          {selectedItem && <Icon name={selectedItem.icon} style={styles.dropdownButtonIconStyle} />}
                          <Text style={styles.dropdownButtonTxtStyle}>
                            {(selectedItem && selectedItem.title) || 'Select gender'}
                          </Text>
                          <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} style={styles.dropdownButtonArrowStyle} />
                        </View>
                      )}
                      renderItem={(item, _index, isSelected) => (
                        <View
                          style={{
                            ...styles.dropdownItemStyle,
                            ...(isSelected && { backgroundColor: '#D2D9DF' }),
                          }}
                        >
                          <Icon name={item.icon} style={styles.dropdownItemIconStyle} />
                          <Text style={styles.dropdownItemTxtStyle}>{item.title}</Text>
                        </View>
                      )}
                      showsVerticalScrollIndicator={false}
                      dropdownStyle={styles.dropdownMenuStyle}
                    />
                  </View>

                  <View style={styles.textInputContainer2}>
                    <Text style={styles.textInputLbl}>Mobile Number</Text>
                    <TextInput
                      value={mobileNum}
                      onChangeText={setMobileNum}
                      style={styles.input}
                      keyboardType='number-pad'
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.textInputContainer2}>
                    <Text style={styles.textInputLbl}>Password</Text>
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      style={styles.input}
                      secureTextEntry
                    />
                  </View>

                  <View style={styles.textInputContainer2}>
                    <Text style={styles.textInputLbl}>Confirm Password</Text>
                    <TextInput
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      style={styles.input}
                      secureTextEntry
                    />
                  </View>
                </View>

                <View style={styles.loginContainer}>
                  <Text style={styles.questionLbl}>Have an account?</Text>
                  <TouchableOpacity onPress={() => router.navigate('/auth/login')}>
                    <Text style={styles.loginLbl}>Log In</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.button} onPress={() => handleAddUser()}>
                  <Text style={styles.buttonTxt}>Sign Up</Text>
                </TouchableOpacity>

                <Modal
                  animationType='fade'
                  backdropColor={'rgba(0, 0, 0, 0.5)'}
                  visible={carOwnerModalVisible}
                  onRequestClose={() => isCarOwnerModalVisible(!carOwnerModalVisible)}
                >
                  <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                      <Text style={styles.modalTxt}>Account created successfully. Thank you for registering!</Text>
                      <TouchableOpacity
                        style={styles.modalButton}
                        onPress={() => {
                          isCarOwnerModalVisible(!carOwnerModalVisible)
                          router.navigate('/auth/login');
                          setPage('');
                        }}>
                        <Text style={styles.buttonTxt}>Ok</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>
              </>
            )}

            {page === 'Repair Shop' && (
              <>
                <TouchableOpacity style={styles.arrowWrapper} onPress={() => router.push('/auth/login')}>
                  <Icon name='arrow-left' style={styles.arrowBack} />
                </TouchableOpacity>

                <Text style={styles.header}>Create Account</Text>
                <View style={styles.row}>
                  <View style={styles.textInputContainer2}>
                    <Text style={styles.textInputLbl}>First Name</Text>
                    <TextInput
                      value={firstname}
                      onChangeText={setFirstname}
                      style={styles.input}
                    />
                  </View>

                  <View style={styles.textInputContainer2}>
                    <Text style={styles.textInputLbl}>Last Name</Text>
                    <TextInput
                      value={lastname}
                      onChangeText={setLastname}
                      style={styles.input}
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.textInputContainer2}>
                    <Text style={styles.textInputLbl}>Gender</Text>
                    <SelectDropdown
                      data={genders}
                      onSelect={(selectedItem) => setGender(selectedItem.title)}
                      renderButton={(selectedItem, isOpen) => (
                        <View style={styles.dropdownButtonStyle}>
                          {selectedItem && <Icon name={selectedItem.icon} style={styles.dropdownButtonIconStyle} />}
                          <Text style={styles.dropdownButtonTxtStyle}>
                            {(selectedItem && selectedItem.title) || 'Select gender'}
                          </Text>
                          <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} style={styles.dropdownButtonArrowStyle} />
                        </View>
                      )}
                      renderItem={(item, _index, isSelected) => (
                        <View
                          style={{
                            ...styles.dropdownItemStyle,
                            ...(isSelected && { backgroundColor: '#D2D9DF' }),
                          }}
                        >
                          <Icon name={item.icon} style={styles.dropdownItemIconStyle} />
                          <Text style={styles.dropdownItemTxtStyle}>{item.title}</Text>
                        </View>
                      )}
                      showsVerticalScrollIndicator={false}
                      dropdownStyle={styles.dropdownMenuStyle}
                    />
                  </View>

                  <View style={styles.textInputContainer2}>
                    <Text style={styles.textInputLbl}>Mobile Number</Text>
                    <TextInput
                      value={mobileNum}
                      onChangeText={setMobileNum}
                      style={styles.input}
                      keyboardType='number-pad'
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.textInputContainer2}>
                    <Text style={styles.textInputLbl}>Password</Text>
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      style={styles.input}
                      secureTextEntry
                    />
                  </View>

                  <View style={styles.textInputContainer2}>
                    <Text style={styles.textInputLbl}>Confirm Password</Text>
                    <TextInput
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      style={styles.input}
                      secureTextEntry
                    />
                  </View>
                </View>

                <View style={styles.textInputContainer3}>
                  <Text style={styles.textInputLbl}>Shop Name</Text>
                  <TextInput
                    value={shopName}
                    onChangeText={setShopName}
                    style={styles.shopNameInput}
                  />
                </View>

                <TouchableOpacity style={styles.button} onPress={() => handleAddRepairShop()}>
                  <Text style={styles.buttonTxt}>Next</Text>
                </TouchableOpacity>
              </>
            )}

            {page === 'Location' && (
              <>
                <TouchableOpacity style={styles.arrowWrapper} onPress={() => setPage('Repair Shop')}>
                  <Icon name='arrow-left' style={styles.arrowBack} />
                </TouchableOpacity>

                <Text style={styles.header}>Location</Text>
                <Text style={styles.textInputLbl}>Please set up your shop location on the map.</Text>

                <MapView
                  style={styles.map}
                  ref={mapRef}
                  mapType='hybrid'
                  initialRegion={region}
                  onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
                >
                  {region && (
                    <Marker
                      coordinate={{
                        latitude: region.latitude,
                        longitude: region.longitude,
                      }}
                      draggable
                      onDragEnd={handleDrag}
                    />
                  )}
                </MapView>
                
                <TouchableOpacity style={styles.button} onPress={() => handleAddRepairShop()}>
                  <Text style={styles.buttonTxt}>Next</Text>
                </TouchableOpacity>
              </>
            )}

            {page === 'Services Offered' && (
              <>
                <TouchableOpacity style={styles.arrowWrapper} onPress={() => setPage('Location')}>
                  <Icon name='arrow-left' style={styles.arrowBack} />
                </TouchableOpacity>

                <Text style={styles.header}>Services Offered</Text>
                <View style={styles.servicesList}>
                  {services.map((item) => (
                    <View key={item.id} style={styles.checkboxContainer}>
                      <Checkbox
                        value={selectedServices.includes(item.label)}
                        onValueChange={() => toggleCheckbox(item.label)}
                        color={selectedServices.includes(item.label) ? '#000B58' : undefined}
                      />
                      <Text style={styles.checkboxTxt}>{item.label}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity style={styles.button} onPress={() => handleAddRepairShop()}>
                  <Text style={styles.buttonTxt}>Submit</Text>
                </TouchableOpacity>

                <Modal
                  animationType='fade'
                  backdropColor={'rgba(0, 0, 0, 0.5)'}
                  visible={repairShopModalVisible}
                  onRequestClose={() => isRepairShopModalVisible(!repairShopModalVisible)}
                >
                  <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                      <Text style={styles.modalTxt}>Thank you for registering! Please wait for admin approval. An update will be sent via SMS.</Text>
                      <TouchableOpacity
                        style={styles.modalButton}
                        onPress={() => {
                          isRepairShopModalVisible(!repairShopModalVisible)
                          router.navigate('/auth/login');
                          setPage('');
                        }}>
                        <Text style={styles.buttonTxt}>Ok</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>   
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  upperBox: {
    backgroundColor: '#000B58',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    padding: 10,
  },
  welcomeTxt: {
    color: '#FFF',
    fontSize: 30,
    fontFamily: 'LeagueSpartan_Bold',
    marginBottom: 10,
  },
  upperTextInputLbl: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'LeagueSpartan',
  },
  upperDropdownButtonStyle: {
    width: '100%',
    height: 45,
    backgroundColor: '#EAEAEA',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  lowerBox: {
    alignItems: 'center',
    flex: 1,
  },
  header: {
    color: '#000B58',
    fontSize: 22,
    fontFamily: 'LeagueSpartan_Bold',
    marginTop: 10,
  },
  textInputContainer1: {
    gap: 10,
    marginTop: 10,
    width: '50%',
  },
  textInputContainer2: {
    gap: 10,
    marginTop: 10,
    width: '45%',
  },
  textInputContainer3: {
    gap: 10,
    marginTop: 10,
    width: '93%',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-evenly',
  },
  textInputLbl: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'LeagueSpartan',
  },
  input: {
    backgroundColor: '#EAEAEA',
    width: '100%',
    height: 45,
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    color: '#333',
    fontFamily: 'LeagueSpartan',
  },
  dropdownButtonStyle: {
    width: '100%',
    height: 45,
    backgroundColor: '#EAEAEA',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  dropdownButtonTxtStyle: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontFamily: 'LeagueSpartan',
  },
  dropdownButtonArrowStyle: {
    fontSize: 24,
    color: '#333',
  },
  dropdownButtonIconStyle: {
    fontSize: 24,
    color: '#333',
    marginRight: 8,
  },
  dropdownMenuStyle: {
    backgroundColor: '#EAEAEA',
    borderRadius: 10,
    marginTop: -1,
  },
  dropdownItemStyle: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dropdownItemTxtStyle: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontFamily: 'LeagueSpartan',
  },
  dropdownItemIconStyle: {
    fontSize: 24,
    color: '#333',
    marginRight: 8,
  },
  questionLbl: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'LeagueSpartan',
  },
  loginLbl: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'LeagueSpartan_Bold',
    textDecorationLine: 'underline',
  },
  loginContainer: {
    flexDirection: 'column',
    gap: 5,
    alignItems: 'center',
    marginTop: 30,
  },
  button: {
    width: '40%',
    height: 45,
    backgroundColor: '#000B58',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  buttonTxt: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'LeagueSpartan_Bold',
  },
  shopNameInput: {
    backgroundColor: '#EAEAEA',
    width: '100%',
    height: 45,
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    fontFamily: 'LeagueSpartan',
  },
  map: {
    width: '100%',
    height: 350,
    borderRadius: 10,
  },
  arrowWrapper: {
    top: 15,
    right: 320,
    position: 'absolute',
  },
  arrowBack: {
    fontSize: 24,
    color: '#000B58',
  },
  servicesList: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 10,
  },
  checkboxTxt: {
    fontSize: 16,
    fontFamily: 'LeagueSpartan',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: '#FFF',
    width: '70%',
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
  modalTxt: {
    textAlign: 'center',
    fontFamily: 'LeagueSpartan',
    color: '#333',
    fontSize: 16,
  },
  modalButton: {
    width: '50%',
    height: 45,
    backgroundColor: '#000B58',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginTop: 10,
  },
})

export default Signup