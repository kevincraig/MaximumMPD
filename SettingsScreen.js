/*
* The MIT License (MIT)
*
* Copyright (c) 2018 Richard Backhouse
*
* Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
* to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
* and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
* DEALINGS IN THE SOFTWARE.
*/

import React from 'react';
import { View, Picker, Modal, Text, StyleSheet, Alert } from 'react-native';
import SettingsList from 'react-native-settings-list';
import { FormLabel, FormInput, Button } from 'react-native-elements'
import MPDConnection from './MPDConnection';

class CrossfadeModal extends React.Component {
    state = {
        crossFade: 3
    }

    onOk() {
        this.props.onSet(this.state.crossFade);
    }

    onCancel(visible) {
        this.props.onCancel();
    }

    render() {
        const visible = this.props.visible;
        const value = this.props.value;
        return (
            <Modal
                animationType="fade"
                transparent={false}
                visible={visible}
                onRequestClose={() => {
            }}>
                <View style={{marginTop: 22, flex: .6, flexDirection: 'column', justifyContent: 'space-around'}}>
                    <View style={{ flex: .3, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{fontSize: 20, fontFamily: 'GillSans-Italic'}}>Set Crossfade</Text>
                    </View>
                    <FormLabel>Crossfade (Seconds)</FormLabel>
                    <FormInput value={value} keyboardType='numeric' maxLength={5} onChangeText={(crossFade) => this.setState({crossFade})} style={styles.entryField}></FormInput>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                        <Button
                            onPress={() => {this.onOk();}}
                            title="Ok"
                            icon={{name: 'check', type: 'font-awesome'}}
                            raised={true}
                            rounded
                            backgroundColor={'#3396FF'}
                        />
                        <Button
                            onPress={() => {this.onCancel();}}
                            title="Cancel"
                            icon={{name: 'times-circle', type: 'font-awesome'}}
                            raised={true}
                            rounded
                            backgroundColor={'#3396FF'}
                        />
                    </View>

                </View>
            </Modal>
        );
    }
}

class ReplayGainModal extends React.Component {
    state = {
        replayGain: ""
    }

    onOk() {
        this.props.onSet(this.state.replayGain);
    }

    onCancel(visible) {
        this.props.onCancel();
    }

    render() {
        const visible = this.props.visible;
        return (
            <Modal
                animationType="fade"
                transparent={false}
                visible={visible}
                onRequestClose={() => {
            }}>
                <View style={{marginTop: 22, flex: .6, flexDirection: 'column', justifyContent: 'space-around'}}>
                    <View style={{ flex: .3, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{fontSize: 20, fontFamily: 'GillSans-Italic'}}>Set Replay Gain</Text>
                    </View>
                    <Picker
                        selectedValue={this.state.replayGain}
                        onValueChange={(itemValue, itemIndex) => this.setState({replayGain: itemValue})}>
                        <Picker.Item label="Off" value="off" />
                        <Picker.Item label="Track" value="track" />
                        <Picker.Item label="Album" value="album" />
                        <Picker.Item label="Auto" value="auto" />
                    </Picker>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                        <Button
                            onPress={() => {this.onOk();}}
                            title="Ok"
                            icon={{name: 'check', type: 'font-awesome'}}
                            raised={true}
                            rounded
                            backgroundColor={'#3396FF'}
                        />
                        <Button
                            onPress={() => {this.onCancel();}}
                            title="Cancel"
                            icon={{name: 'times-circle', type: 'font-awesome'}}
                            raised={true}
                            rounded
                            backgroundColor={'#3396FF'}
                        />
                    </View>
                </View>
            </Modal>
        );
    }
}

export default class SettingsScreen extends React.Component {
    static navigationOptions = {
        title: 'Settings'
    };

    state = {
        replayGain: "Off",
        replayGainVisible: false,
        crossfade: 3,
        crossfadeVisible: false,
        shuffle: false,
        repeat: false,
        stopAftetSongPlayed: false,
        removeSongAfterPlay: false,
        randomPlaylistByType: false
    }

    componentDidMount() {
        this.onConnect = MPDConnection.getEventEmitter().addListener(
            "OnConnect",
            () => {
                this.getStatus();
                this.setState({randomPlaylistByType: MPDConnection.current().isRandomPlaylistByType()});
            }
        );

        this.onDisconnect = MPDConnection.getEventEmitter().addListener(
            "OnDisconnect",
            () => {
                this.setState({
                    replayGain: "off",
                    crossfade: 0,
                    shuffle: false,
                    repeat: false,
                    stopAftetSongPlayed: false,
                    removeSongAfterPlay: false
                });
            }
        );
        if (MPDConnection.isConnected()) {
            this.getStatus();
        }
    }

    componentWillUnmount() {
        this.onConnect.remove();
        this.onDisconnect.remove();
    }

    getStatus() {
        MPDConnection.current().getStatus(
            (status) => {
                this.setState({
                    replayGain: status.replayGainStatus,
                    crossfade: status.xfade || 0,
                    shuffle: (status.random === '1') ? true : false,
                    repeat: (status.repeat === '1') ? true : false,
                    stopAftetSongPlayed: (status.single === '1') ? true : false,
                    removeSongAfterPlay: (status.consume === '1') ? true : false
                });
            },
            (err) => {
                Alert.alert(
                    "MPD Error",
                    "Error : "+err
                );
            }
        );
    }

    updateDB() {
        if (MPDConnection.isConnected()) {
            MPDConnection.current().update();
            Alert.alert(
                "DB Update",
                "DB update has started"
            );
        }
    }

    onShuffleChange(value) {
        this.setState({shuffle: value});
        if (MPDConnection.isConnected()) {
            MPDConnection.current().shuffle(value);
        }
    }

    onRepeatChange(value) {
        this.setState({repeat: value});
        if (MPDConnection.isConnected()) {
            MPDConnection.current().repeat(value);
        }
    }

    onRemoveSongAfterPlayChange(value) {
        this.setState({removeSongAfterPlay: value});
        if (MPDConnection.isConnected()) {
            MPDConnection.current().consume(value);
        }
    }

    onStopAftetSongPlayedChange(value) {
        this.setState({stopAftetSongPlayed: value});
        if (MPDConnection.isConnected()) {
            MPDConnection.current().single(value);
        }
    }

    onRandomPlaylistByTypeChange(value) {
        this.setState({randomPlaylistByType: value});

        if (MPDConnection.isConnected()) {
            MPDConnection.current().setRandomPlaylistByType(value);
            MPDConnection.updateConnection(MPDConnection.current())
                .then(() => {
                    console.log("connection updated");
                });
        }
    }

    setCrossfade(value) {
        this.setState({crossfade: value});
        this.setState({crossfadeVisible: false});
        if (MPDConnection.isConnected()) {
            MPDConnection.current().crossfade(value);
        }
    }

    setReplayGain(value) {
        this.setState({replayGain: value});
        this.setState({replayGainVisible: false});
        if (MPDConnection.isConnected()) {
            MPDConnection.current().replayGainMode(value);
        }
    }

    render() {
        const replayGainValue = this.state.replayGain;
        const crossfadeValue = this.state.crossfade + " seconds";
        return (
            <View style={{backgroundColor:'#EFEFF4',flex:1}}>
                <SettingsList borderColor='#c8c7cc' defaultItemSize={50}>
                    <SettingsList.Header headerStyle={{marginTop:15}}/>
                    <SettingsList.Item
                      hasNavArrow={true}
                      title='Connections'
                      onPress={() => this.props.navigation.navigate('Connections', {navigateOnConnect: false})}
                    />
                    <SettingsList.Item
                      hasNavArrow={true}
                      title='Update Database'
                      onPress={() => this.updateDB()}
                    />
                    <SettingsList.Header headerStyle={{marginTop:15}} headerText="Playing Configuration"/>
                    <SettingsList.Item
                                hasNavArrow={false}
                                switchState={this.state.shuffle}
                                hasSwitch={true}
                                switchOnValueChange={(value) => this.onShuffleChange(value)}
                                title='Shuffle'/>
                    <SettingsList.Item
                                hasNavArrow={false}
                                switchState={this.state.repeat}
                                hasSwitch={true}
                                switchOnValueChange={(value) => this.onRepeatChange(value)}
                                title='Repeat'/>
                    <SettingsList.Item
                                hasNavArrow={false}
                                switchState={this.state.removeSongAfterPlay}
                                hasSwitch={true}
                                switchOnValueChange={(value) => this.onRemoveSongAfterPlayChange(value)}
                                title='Remove song after play'/>
                    <SettingsList.Item
                                hasNavArrow={false}
                                switchState={this.state.stopAftetSongPlayed}
                                hasSwitch={true}
                                switchOnValueChange={(value) => this.onStopAftetSongPlayedChange(value)}
                                title='Stop after song played'/>
                    <SettingsList.Item
                                hasNavArrow={false}
                                switchState={this.state.randomPlaylistByType}
                                hasSwitch={true}
                                switchOnValueChange={(value) => this.onRandomPlaylistByTypeChange(value)}
                                title='Random Playlist by type'/>
                    <SettingsList.Item
                                  hasNavArrow={true}
                                  title='Replay Gain'
                                  titleInfo={replayGainValue}
                                  titleInfoStyle={{fontFamily: 'GillSans-Italic'}}
                                  onPress={() => this.setState({replayGainVisible: true})}
                                />
                    <SettingsList.Item
                                  hasNavArrow={true}
                                  title='Crossfade'
                                  titleInfo={crossfadeValue}
                                  titleInfoStyle={{fontFamily: 'GillSans-Italic'}}
                                  onPress={() => this.setState({crossfadeVisible: true})}
                                />
                </SettingsList>
                <ReplayGainModal replayGain={this.state.replayGain} visible={this.state.replayGainVisible} onSet={(value) => {this.setReplayGain(value)}} onCancel={() => this.setState({replayGainVisible: false})}></ReplayGainModal>
                <CrossfadeModal value={this.state.crossfade} visible={this.state.crossfadeVisible} onSet={(value) => {this.setCrossfade(value)}} onCancel={() => this.setState({crossfadeVisible: false})}></CrossfadeModal>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    entryField: {
        width: 150,
        height: 30,
        margin: 15,
        borderColor: '#e3e5e5',
        borderWidth: 1
    }
});