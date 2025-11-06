import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';

const PrivacyPolicyComp = () => {
  return (
    <View>
      <View style={styles.headerContainer}>
        <View style={styles.headerBadge}>
          <MaterialCommunityIcons name="clock-outline" size={16} color="#6B7280" />
          <Text style={styles.effectiveDate}>Effective October 29, 2025</Text>
        </View>
        <Text style={styles.headerDescription}>
          Welcome to Auto AIDER. This Privacy Policy explains how we collect, use, and protect your personal information
          when you use our app.
        </Text>
      </View>

      <View style={styles.policyContainer}>
        <View style={styles.policySection}>
          <View style={styles.policyHeader}>
            <View style={styles.policyNumberBadge}>
              <Text style={styles.policyNumber}>1</Text>
            </View>
            <Text style={styles.subHeaderText}>Information We Collect</Text>
          </View>
          <Text style={styles.text}>We collect the following types of information:</Text>
          <View style={styles.bulletView}>
            <MaterialCommunityIcons name="checkbox-marked-circle" size={18} color="#000B58" />
            <Text style={styles.bulletedText}>
              <Text style={styles.nestedText}>Personal Information:</Text> When you create an account, we may collect
              your name, email, phone number, and other details you provide.
            </Text>
          </View>
          <View style={styles.bulletView}>
            <MaterialCommunityIcons name="checkbox-marked-circle" size={18} color="#000B58" />
            <Text style={styles.bulletedText}>
              <Text style={styles.nestedText}>Location Data:</Text> We collect your real-time location to show nearby
              repair shops and track your vehicle diagnostics.
            </Text>
          </View>
          <View style={styles.bulletView}>
            <MaterialCommunityIcons name="checkbox-marked-circle" size={18} color="#000B58" />
            <Text style={styles.bulletedText}>
              <Text style={styles.nestedText}>Vehicle Information:</Text> When you scan or register a vehicle, we may
              store its make, model, year, and diagnostic data (DTC codes).
            </Text>
          </View>
          <View style={styles.bulletView}>
            <MaterialCommunityIcons name="checkbox-marked-circle" size={18} color="#000B58" />
            <Text style={styles.bulletedText}>
              <Text style={styles.nestedText}>Usage Data:</Text> We may collect anonymous data on how you interact with
              the app to improve performance and user experience.
            </Text>
          </View>
        </View>

        <View style={styles.policySection}>
          <View style={styles.policyHeader}>
            <View style={styles.policyNumberBadge}>
              <Text style={styles.policyNumber}>2</Text>
            </View>
            <Text style={styles.subHeaderText}>How We Use Your Information</Text>
          </View>
          <Text style={styles.text}>We use the collected data to:</Text>
          <View style={styles.bulletView}>
            <MaterialCommunityIcons name="checkbox-marked-circle" size={18} color="#000B58" />
            <Text style={styles.bulletedText}>Provide and improve app features and services</Text>
          </View>
          <View style={styles.bulletView}>
            <MaterialCommunityIcons name="checkbox-marked-circle" size={18} color="#000B58" />
            <Text style={styles.bulletedText}>Display nearby auto repair shops and route information</Text>
          </View>
          <View style={styles.bulletView}>
            <MaterialCommunityIcons name="checkbox-marked-circle" size={18} color="#000B58" />
            <Text style={styles.bulletedText}>Store and retrieve your diagnostic scan history</Text>
          </View>
          <View style={styles.bulletView}>
            <MaterialCommunityIcons name="checkbox-marked-circle" size={18} color="#000B58" />
            <Text style={styles.bulletedText}>Communicate updates, alerts, or technical support messages</Text>
          </View>
          <View style={styles.bulletView}>
            <MaterialCommunityIcons name="checkbox-marked-circle" size={18} color="#000B58" />
            <Text style={styles.bulletedText}>Comply with legal obligations</Text>
          </View>
        </View>

        <View style={styles.policySection}>
          <View style={styles.policyHeader}>
            <View style={styles.policyNumberBadge}>
              <Text style={styles.policyNumber}>3</Text>
            </View>
            <Text style={styles.subHeaderText}>Sharing of Information</Text>
          </View>
          <Text style={styles.text}>
            We <Text style={styles.nestedText}>do not sell</Text> your personal data.
          </Text>
          <Text style={styles.text}>We may share limited data with:</Text>
          <View style={styles.bulletView}>
            <MaterialCommunityIcons name="checkbox-marked-circle" size={18} color="#000B58" />
            <Text style={styles.bulletedText}>
              <Text style={styles.nestedText}>Service Providers:</Text> For hosting, database management, or analytics
            </Text>
          </View>
          <View style={styles.bulletView}>
            <MaterialCommunityIcons name="checkbox-marked-circle" size={18} color="#000B58" />
            <Text style={styles.bulletedText}>
              <Text style={styles.nestedText}>Authorized Auto Repair Shops:</Text> Only if you request or authorize
              communication
            </Text>
          </View>
        </View>

        <View style={styles.policySection}>
          <View style={styles.policyHeader}>
            <View style={styles.policyNumberBadge}>
              <Text style={styles.policyNumber}>4</Text>
            </View>
            <Text style={styles.subHeaderText}>Data Storage and Security</Text>
          </View>
          <Text style={styles.text}>Your data is stored securely in encrypted databases.</Text>
          <Text style={styles.text}>
            We use authentication, encryption, and limited access controls to protect your information.
          </Text>
        </View>

        <View style={styles.policySection}>
          <View style={styles.policyHeader}>
            <View style={styles.policyNumberBadge}>
              <Text style={styles.policyNumber}>5</Text>
            </View>
            <Text style={styles.subHeaderText}>Your Rights</Text>
          </View>
          <Text style={styles.text}>You may:</Text>
          <View style={styles.bulletView}>
            <MaterialCommunityIcons name="checkbox-marked-circle" size={18} color="#000B58" />
            <Text style={styles.bulletedText}>Access, correct, or delete your account data</Text>
          </View>
          <View style={styles.bulletView}>
            <MaterialCommunityIcons name="checkbox-marked-circle" size={18} color="#000B58" />
            <Text style={styles.bulletedText}>Withdraw location permissions anytime in your device settings</Text>
          </View>
          <View style={styles.bulletView}>
            <MaterialCommunityIcons name="checkbox-marked-circle" size={18} color="#000B58" />
            <Text style={styles.bulletedText}>Contact us to request data deletion</Text>
          </View>
        </View>

        <View style={styles.policySection}>
          <View style={styles.policyHeader}>
            <View style={styles.policyNumberBadge}>
              <Text style={styles.policyNumber}>6</Text>
            </View>
            <Text style={styles.subHeaderText}>Third-Party Services</Text>
          </View>
          <Text style={styles.text}>The app may use third-party services such as:</Text>
          <View style={styles.bulletView}>
            <MaterialCommunityIcons name="checkbox-marked-circle" size={18} color="#000B58" />
            <Text style={styles.bulletedText}>
              <Text style={styles.nestedText}>Google Maps API</Text> for map display and location services
            </Text>
          </View>
          <View style={styles.bulletView}>
            <MaterialCommunityIcons name="checkbox-marked-circle" size={18} color="#000B58" />
            <Text style={styles.bulletedText}>
              <Text style={styles.nestedText}>Firebase / Expo services</Text> for authentication and notifications
            </Text>
          </View>
          <Text style={styles.text}>Each third-party provider follows its own privacy practices.</Text>
        </View>

        <View style={styles.policySection}>
          <View style={styles.policyHeader}>
            <View style={styles.policyNumberBadge}>
              <Text style={styles.policyNumber}>7</Text>
            </View>
            <Text style={styles.subHeaderText}>Changes to This Policy</Text>
          </View>
          <Text style={styles.text}>
            We may update this Privacy Policy from time to time. Updates will be posted in the app and take effect
            immediately.
          </Text>
        </View>

        <View style={styles.policySection}>
          <View style={styles.policyHeader}>
            <View style={styles.policyNumberBadge}>
              <Text style={styles.policyNumber}>8</Text>
            </View>
            <Text style={styles.subHeaderText}>Contact Us</Text>
          </View>
          <Text style={styles.text}>If you have questions about this Privacy Policy, contact us at:</Text>
          <View style={styles.contactContainer}>
            <View style={styles.iconTextContainer}>
              <View style={styles.contactIconWrapper}>
                <MaterialIcons name="email" size={20} color="#000B58" />
              </View>
              <View style={styles.contactTextWrapper}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.text}>support@autoaider.online</Text>
              </View>
            </View>
            <View style={styles.iconTextContainer}>
              <View style={styles.contactIconWrapper}>
                <Entypo name="facebook" size={20} color="#000B58" />
              </View>
              <View style={styles.contactTextWrapper}>
                <Text style={styles.contactLabel}>Facebook</Text>
                <Text style={styles.text}>Auto AIDER</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  effectiveDate: {
    fontFamily: 'BodyRegular',
    fontSize: 12,
    color: '#6B7280',
  },
  headerDescription: {
    fontFamily: 'BodyRegular',
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 20,
  },
  policyContainer: {
    gap: 16,
  },
  policySection: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  policyNumberBadge: {
    backgroundColor: '#10B981',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  policyNumber: {
    fontFamily: 'HeaderBold',
    fontSize: 16,
    color: '#FFF',
  },
  subHeaderText: {
    fontFamily: 'HeaderBold',
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  text: {
    fontFamily: 'BodyRegular',
    color: '#374151',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  nestedText: {
    fontFamily: 'BodyBold',
    color: '#111827',
  },
  contactContainer: {
    marginTop: 16,
    gap: 12,
  },
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  contactIconWrapper: {
    backgroundColor: '#E0E7FF',
    borderRadius: 8,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactTextWrapper: {
    flex: 1,
  },
  contactLabel: {
    fontFamily: 'BodyBold',
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bulletView: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 8,
  },
  bulletedText: {
    fontFamily: 'BodyRegular',
    color: '#374151',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
});

export default PrivacyPolicyComp;
