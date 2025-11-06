import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';

const TermsOfServiceComp = () => {
  return (
    <View>
      <View style={styles.headerContainer}>
        <View style={styles.headerBadge}>
          <MaterialCommunityIcons name="clock-outline" size={16} color="#6B7280" />
          <Text style={styles.effectiveDate}>Effective October 29, 2025</Text>
        </View>
      </View>

      <View style={styles.termsContainer}>
        <View style={styles.termSection}>
          <View style={styles.termHeader}>
            <View style={styles.termNumberBadge}>
              <Text style={styles.termNumber}>1</Text>
            </View>
            <Text style={styles.subHeaderText}>Acceptance of Terms</Text>
          </View>
          <Text style={styles.text}>
            By creating an account or using the Auto AIDER app, you agree to be bound by these Terms.
          </Text>
        </View>

        <View style={styles.termSection}>
          <View style={styles.termHeader}>
            <View style={styles.termNumberBadge}>
              <Text style={styles.termNumber}>2</Text>
            </View>
            <Text style={styles.subHeaderText}>Description of Service</Text>
          </View>
          <Text style={styles.text}>
            Auto AIDER provides vehicle diagnostic tools, repair shop connections, and related automotive services.
          </Text>
        </View>

        <View style={styles.termSection}>
          <View style={styles.termHeader}>
            <View style={styles.termNumberBadge}>
              <Text style={styles.termNumber}>3</Text>
            </View>
            <Text style={styles.subHeaderText}>User Responsibilities</Text>
          </View>
          <View style={styles.bulletPoint}>
            <MaterialCommunityIcons name="checkbox-marked-circle" size={18} color="#000B58" />
            <Text style={styles.text}>You agree to provide accurate information.</Text>
          </View>
          <View style={styles.bulletPoint}>
            <MaterialCommunityIcons name="checkbox-marked-circle" size={18} color="#000B58" />
            <Text style={styles.text}>You agree not to use the app for illegal or abusive purposes.</Text>
          </View>
        </View>

        <View style={styles.termSection}>
          <View style={styles.termHeader}>
            <View style={styles.termNumberBadge}>
              <Text style={styles.termNumber}>4</Text>
            </View>
            <Text style={styles.subHeaderText}>Accounts and Security</Text>
          </View>
          <Text style={styles.text}>
            You are responsible for maintaining the confidentiality of your account credentials.
          </Text>
        </View>

        <View style={styles.termSection}>
          <View style={styles.termHeader}>
            <View style={styles.termNumberBadge}>
              <Text style={styles.termNumber}>5</Text>
            </View>
            <Text style={styles.subHeaderText}>Disclaimer and Limitation of Liability</Text>
          </View>
          <Text style={styles.text}>
            We are not responsible for any direct or indirect damages arising from the use of the app.
          </Text>
        </View>

        <View style={styles.termSection}>
          <View style={styles.termHeader}>
            <View style={styles.termNumberBadge}>
              <Text style={styles.termNumber}>6</Text>
            </View>
            <Text style={styles.subHeaderText}>Changes to Terms</Text>
          </View>
          <Text style={styles.text}>
            We may update these Terms from time to time. Continued use of the app means you accept any changes.
          </Text>
        </View>

        <View style={styles.termSection}>
          <View style={styles.termHeader}>
            <View style={styles.termNumberBadge}>
              <Text style={styles.termNumber}>7</Text>
            </View>
            <Text style={styles.subHeaderText}>Contact Us</Text>
          </View>
          <Text style={styles.text}>If you have any questions, please contact us at:</Text>
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
  },
  effectiveDate: {
    fontFamily: 'BodyRegular',
    fontSize: 12,
    color: '#6B7280',
  },
  termsContainer: {
    gap: 16,
  },
  termSection: {
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
    borderLeftColor: '#000B58',
  },
  termHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  termNumberBadge: {
    backgroundColor: '#000B58',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  termNumber: {
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
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 8,
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
});

export default TermsOfServiceComp;
