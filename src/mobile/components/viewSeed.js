import get from 'lodash/get';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { View, Text, StyleSheet, TouchableOpacity, Keyboard, TouchableWithoutFeedback, AppState } from 'react-native';
import Fonts from '../theme/Fonts';
import Seedbox from '../components/seedBox';
import CustomTextInput from '../components/customTextInput';
import keychain, { getSeed } from '../util/keychain';
import { width, height } from '../util/dimensions';
import GENERAL from '../theme/general';
import { Icon } from '../theme/icons.js';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    generalText: {
        fontFamily: Fonts.secondary,
        fontSize: width / 23,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    topContainer: {
        flex: 9,
        justifyContent: 'space-around',
    },
    passwordTextContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    textFieldContainer: {
        flex: 2,
        justifyContent: 'flex-start',
        paddingTop: height / 20,
    },
    viewButtonContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    seedBoxContainer: {
        flex: 3.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    hideButtonContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width,
        paddingHorizontal: width / 15,
    },
    titleText: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
    },
    viewButton: {
        borderWidth: 1.5,
        borderRadius: GENERAL.borderRadius,
        width: width / 2.7,
        height: height / 17,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    viewText: {
        fontFamily: 'Lato-Bold',
        fontSize: width / 34.5,
        backgroundColor: 'transparent',
    },
});

class ViewSeed extends Component {
    static propTypes = {
        seedIndex: PropTypes.number.isRequired,
        password: PropTypes.string.isRequired,
        textColor: PropTypes.object.isRequired,
        body: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        borderColor: PropTypes.object.isRequired,
        onWrongPassword: PropTypes.func.isRequired,
        t: PropTypes.func.isRequired,
        backPress: PropTypes.func.isRequired,
    };

    constructor() {
        super();

        this.state = {
            password: '',
            showSeed: false,
            seed: '',
            appState: AppState.currentState, // eslint-disable-line react/no-unused-state
        };

        this.handleAppStateChange = this.handleAppStateChange.bind(this);
    }

    componentDidMount() {
        AppState.addEventListener('change', this.handleAppStateChange);
    }

    componentWillReceiveProps(newProps) {
        if (this.props.seedIndex !== newProps.seedIndex) {
            this.hideSeed();
        }
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this.handleAppStateChange);
    }

    viewSeed() {
        if (this.state.password === this.props.password) {
            keychain
                .get()
                .then((credentials) => {
                    const data = get(credentials, 'data');

                    if (!data) {
                        throw new Error('Error');
                    } else {
                        const seed = getSeed(data, this.props.seedIndex);
                        this.setState({ seed });
                        this.setState({ showSeed: true });
                    }
                })
                .catch((err) => console.error(err)); // eslint-disable-line no-console
        } else {
            this.props.onWrongPassword();
        }
    }

    handleAppStateChange(nextAppState) {
        if (nextAppState.match(/inactive|background/)) {
            this.hideSeed();
        }

        this.setState({ appState: nextAppState }); // eslint-disable-line react/no-unused-state
    }

    hideSeed() {
        this.setState({
            seed: '',
            showSeed: false,
            password: '',
        });
    }

    render() {
        const {
            t,
            textColor,
            body,
            borderColor,
            theme,
        } = this.props;
        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        {!this.state.showSeed && (
                            <View style={styles.passwordTextContainer}>
                                <Text style={[styles.generalText, textColor]}>{t('viewSeed:enterPassword')}</Text>
                            </View>
                        )}
                        {!this.state.showSeed && (
                            <View style={styles.textFieldContainer}>
                                <CustomTextInput
                                    label={t('global:password')}
                                    onChangeText={(password) => this.setState({ password })}
                                    containerStyle={{ width: width / 1.2 }}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    enablesReturnKeyAutomatically
                                    returnKeyType="done"
                                    secureTextEntry
                                    onSubmitEditing={this.handleLogin}
                                    value={this.state.password}
                                    theme={theme}
                                />
                            </View>
                        )}
                        {this.state.password.length > 0 &&
                            !this.state.showSeed && (
                                <View style={styles.viewButtonContainer}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            this.viewSeed();
                                        }}
                                    >
                                        <View style={[styles.viewButton, borderColor]}>
                                            <Text style={[styles.viewText, textColor]}>{t('viewSeed:viewSeed')}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            )}

                        {this.state.password.length === 0 && <View style={styles.viewButtonContainer} />}

                        {this.state.showSeed && (
                            <View style={{ flex: 1 }}>
                                <View style={styles.seedBoxContainer}>
                                    <Seedbox
                                        seed={this.state.seed}
                                        backgroundColor={body.bg}
                                        borderColor={borderColor}
                                        textColor={textColor}
                                    />
                                </View>
                                <View style={styles.hideButtonContainer}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            this.hideSeed();
                                        }}
                                    >
                                        <View style={[styles.viewButton, borderColor]}>
                                            <Text style={[styles.viewText, textColor]}>{t('viewSeed:hideSeed')}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity
                            onPress={() => this.props.backPress()}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.item}>
                                <Icon name="chevronLeft" size={width / 28} color={body.color} />
                                <Text style={[styles.titleText, textColor]}>{t('global:backLowercase')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

export default translate(['viewSeed', 'global'])(ViewSeed);
