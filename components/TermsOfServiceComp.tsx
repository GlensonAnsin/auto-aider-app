import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';

const TermsOfServiceComp = () => {
  return (
    <View>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Terms of Service</Text>
        <Text style={[styles.text, { marginLeft: 0, color: '#555' }]}>Effective October 29, 2025</Text>
      </View>

      <View style={styles.termsContainer}>
        <Text style={styles.subHeaderText}>1. Acceptance of Terms</Text>
        <Text style={styles.text}>
          By creating an account or using the Auto AIDER app, you agree to be bound by these Terms.
        </Text>

        <Text style={styles.subHeaderText}>2. Description of Service</Text>
        <Text style={styles.text}>
          Auto AIDER provides vehicle diagnostic tools, repair shop connections, and related automotive services.
        </Text>

        <Text style={styles.subHeaderText}>3. User Responsibilities</Text>
        <Text style={styles.text}>- You agree to provide accurate information.</Text>
        <Text style={styles.text}>- You agree not to use the app for illegal or abusive purposes.</Text>

        <Text style={styles.subHeaderText}>4. Accounts and Security</Text>
        <Text style={styles.text}>
          You are responsible for maintaining the confidentiality of your account credentials.
        </Text>

        <Text style={styles.subHeaderText}>5. Disclaimer and Limitation of Liability</Text>
        <Text style={styles.text}>
          We are not responsible for any direct or indirect damages arising from the use of the app.
        </Text>

        <Text style={styles.subHeaderText}>6. Changes to Terms</Text>
        <Text style={styles.text}>
          We may update these Terms from time to time. Continued use of the app means you accept any changes.
        </Text>

        <Text style={styles.subHeaderText}>7. Contact Us</Text>
        <Text style={styles.text}>If you have any questions, please contact us at:</Text>
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
  termsContainer: {},
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
  contactContainer: {},
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
});

export default TermsOfServiceComp;
