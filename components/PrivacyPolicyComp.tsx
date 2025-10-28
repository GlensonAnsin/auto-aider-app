import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';

const PrivacyPolicyComp = () => {
  return (
    <View>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Privacy Policy</Text>
        <Text style={[styles.text, { color: '#555' }]}>Effective October 29, 2025</Text>
        <Text style={styles.text}>
          Welcome to Auto AIDER. This Privacy Policy explains how we collect, use, and protect your personal information
          when you use our app.
        </Text>
      </View>

      <View style={styles.policyContainer}>
        <Text style={styles.subHeaderText}>1. Information We Collect</Text>
        <Text style={styles.text}>We collect the following types of information:</Text>
        <View style={styles.bulletView}>
          <Text style={styles.bullet}>{'\u2022'}</Text>
          <Text style={styles.bulletedText}>
            <Text style={styles.nestedText}>Personal Information:</Text> When you create an account, we may collect your
            name, email, phone number, and other details you provide.
          </Text>
        </View>
        <View style={styles.bulletView}>
          <Text style={styles.bullet}>{'\u2022'}</Text>
          <Text style={styles.bulletedText}>
            <Text style={styles.nestedText}>Location Data:</Text> We collect your real-time location to show nearby
            repair shops and track your vehicle diagnostics.
          </Text>
        </View>
        <View style={styles.bulletView}>
          <Text style={styles.bullet}>{'\u2022'}</Text>
          <Text style={styles.bulletedText}>
            <Text style={styles.nestedText}>Vehicle Information:</Text> When you scan or register a vehicle, we may
            store its make, model, year, and diagnostic data (DTC codes).
          </Text>
        </View>
        <View style={styles.bulletView}>
          <Text style={styles.bullet}>{'\u2022'}</Text>
          <Text style={styles.bulletedText}>
            <Text style={styles.nestedText}>Usage Data:</Text> We may collect anonymous data on how you interact with
            the app to improve performance and user experience.
          </Text>
        </View>

        <Text style={styles.subHeaderText}>2. How We Use Your Information</Text>
        <Text style={styles.text}>We use the collected data to:</Text>
        <View style={styles.bulletView}>
          <Text style={styles.bullet}>{'\u2022'}</Text>
          <Text style={styles.bulletedText}>Provide and improve app features and services</Text>
        </View>
        <View style={styles.bulletView}>
          <Text style={styles.bullet}>{'\u2022'}</Text>
          <Text style={styles.bulletedText}>Display nearby auto repair shops and route information</Text>
        </View>
        <View style={styles.bulletView}>
          <Text style={styles.bullet}>{'\u2022'}</Text>
          <Text style={styles.bulletedText}>Store and retrieve your diagnostic scan history</Text>
        </View>
        <View style={styles.bulletView}>
          <Text style={styles.bullet}>{'\u2022'}</Text>
          <Text style={styles.bulletedText}>Communicate updates, alerts, or technical support messages</Text>
        </View>
        <View style={styles.bulletView}>
          <Text style={styles.bullet}>{'\u2022'}</Text>
          <Text style={styles.bulletedText}>Comply with legal obligations</Text>
        </View>

        <Text style={styles.subHeaderText}>3. Sharing of Information</Text>
        <Text style={styles.text}>
          We <Text style={styles.nestedText}>do not sell</Text> your personal data.
        </Text>
        <Text style={styles.text}>
          <Text style={styles.text}>We may share limited data with:</Text>
        </Text>
        <View style={styles.bulletView}>
          <Text style={styles.bullet}>{'\u2022'}</Text>
          <Text style={styles.bulletedText}>
            <Text style={styles.nestedText}>Service Providers:</Text> For hosting, database management, or analytics
          </Text>
        </View>
        <View style={styles.bulletView}>
          <Text style={styles.bullet}>{'\u2022'}</Text>
          <Text style={styles.bulletedText}>
            <Text style={styles.nestedText}>Authorized Auto Repair Shops:</Text> Only if you request or authorize
            communication
          </Text>
        </View>

        <Text style={styles.subHeaderText}>4. Data Storage and Security</Text>
        <Text style={styles.text}>Your data is stored securely in encrypted databases.</Text>
        <Text style={styles.text}>
          We use authentication, encryption, and limited access controls to protect your information.
        </Text>

        <Text style={styles.subHeaderText}>5. Your Rights</Text>
        <Text style={styles.text}>You may:</Text>
        <View style={styles.bulletView}>
          <Text style={styles.bullet}>{'\u2022'}</Text>
          <Text style={styles.bulletedText}>Access, correct, or delete your account data</Text>
        </View>
        <View style={styles.bulletView}>
          <Text style={styles.bullet}>{'\u2022'}</Text>
          <Text style={styles.bulletedText}>Withdraw location permissions anytime in your device settings</Text>
        </View>
        <View style={styles.bulletView}>
          <Text style={styles.bullet}>{'\u2022'}</Text>
          <Text style={styles.bulletedText}>Contact us to request data deletion</Text>
        </View>

        <Text style={styles.subHeaderText}>6. Third-Party Services</Text>
        <Text style={styles.text}>The app may use third-party services such as:</Text>
        <View style={styles.bulletView}>
          <Text style={styles.bullet}>{'\u2022'}</Text>
          <Text style={styles.bulletedText}>
            <Text style={styles.nestedText}>Google Maps API</Text> for map display and location services
          </Text>
        </View>
        <View style={styles.bulletView}>
          <Text style={styles.bullet}>{'\u2022'}</Text>
          <Text style={styles.bulletedText}>
            <Text style={styles.nestedText}>Firebase / Expo services</Text> for authentication and notifications
          </Text>
        </View>
        <Text style={styles.text}>Each third-party provider follows its own privacy practices.</Text>

        <Text style={styles.subHeaderText}>7. Changes to This Policy</Text>
        <Text style={styles.text}>
          We may update this Privacy Policy from time to time. Updates will be posted in the app and take effect
          immediately.
        </Text>

        <Text style={styles.subHeaderText}>8. Contact Us</Text>
        <Text style={styles.text}>If you have questions about this Privacy Policy, contact us at:</Text>
        <View style={styles.contactContainer}>
          <View style={styles.iconTextContainer}>
            <MaterialIcons name="email" size={24} color="#000B58" />
            <Text style={styles.text}>support@autoaider.online</Text>
          </View>
          <View style={styles.iconTextContainer}>
            <Entypo name="facebook" size={24} color="#000B58" />
            <Text style={styles.text}>Auto AIDER</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: 10,
  },
  headerText: {
    fontFamily: 'BodyBold',
    fontSize: 18,
    color: '#333',
  },
  policyContainer: {},
  subHeaderText: {
    fontFamily: 'BodyBold',
    fontSize: 16,
    color: '#333',
    marginTop: 10,
  },
  text: {
    fontFamily: 'BodyRegular',
    color: '#333',
  },
  nestedText: {
    fontFamily: 'BodyBold',
  },
  contactContainer: {},
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  bulletView: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
  },
  bullet: {
    fontFamily: 'BodyRegular',
    color: '#333',
  },
  bulletedText: {
    fontFamily: 'BodyRegular',
    color: '#333',
    maxWidth: '93%',
  },
});

export default PrivacyPolicyComp;
