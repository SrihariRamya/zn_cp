import React, { Component } from 'react';
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from '@react-google-maps/api';
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from 'react-places-autocomplete';
import { Input, Row, Col, notification } from 'antd';
import axios from 'axios';
import Geocode from 'react-geocode';
import './store.less';
import { get } from 'lodash';
import {
  getStateName,
  getCity,
  getArea,
  getLocation,
} from '../../shared/map-helper';
import { FAILED_TO_LOAD } from '../../shared/constant-values';

const divStyle = {
  background: 'white',
  border: '1px solid #ccc',
  padding: 10,
  fontWeight: 'bold',
};
class ReloadMap extends LoadScript {
  componentDidMount() {
    const cleaningUp = true;
    const isBrowser = typeof document !== 'undefined';
    const isAlreadyLoaded =
      window.google &&
      window.google.maps &&
      document.querySelector('body.first-hit-completed');
    if (!isAlreadyLoaded && isBrowser) {
      if (window.google && !cleaningUp) {
        return;
      }
      this.isCleaningUp().then(this.injectScript);
    }
    if (isAlreadyLoaded) {
      this.setState({ loaded: true });
    }
  }
}
class GoogleMaps extends Component {
  constructor(properties) {
    super(properties);
    Geocode.setApiKey(`${properties.GoogleMapsAPI}&libraries=places`);
    Geocode.enableDebug();
    this.state = {
      address: '',
      isOpenInfo: false,
      isMarker: true,
      mapSize: 15,
      markerPosition: {
        lat: 13.0826802,
        lng: 80.2707184,
      },
      GoogleMapsAPI: properties.GoogleMapsAPI,
    };
  }

  handleChange = (address) => {
    this.setState({ address, mapSize: 15 });
  };

  getLocationDetails = (position, mode) => {
    axios
      .get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.lat},${position.lng}&key=${this.state.GoogleMapsAPI}&libraries=places`
      )
      .then((response) => {
        if (response.data.status === 'OK') {
          const addressArray = get(
            response,
            'data.results[0].address_components',
            ''
          );
          const address = get(
            response,
            'data.results[0].formatted_address',
            ''
          );
          const latlong = {
            latitude: position.lat,
            longitude: position.lng,
          };
          const city = getCity(addressArray);
          const locality = getLocation(addressArray);
          const area = getArea(addressArray);
          const state = getStateName(addressArray);
          const location = { city, area, state, locality };
          this.props.addressDetails(address, latlong, location);
          if (mode === 'handleSelect') {
            this.setState({
              address,
              isOpenInfo: false,
              isMarker: true,
              mapSize: 18,
              markerPosition: {
                lat: position.lat,
                lng: position.lng,
              },
            });
          } else {
            this.setState({
              markerAddress: address,
              isOpenInfo: true,
            });
          }
        }
      });
  };

  handleSelect = (address) => {
    geocodeByAddress(address)
      .then(async (results) => {
        const latLng = await getLatLng(results[0]);
        const position = {
          lat: latLng.lat,
          lng: latLng.lng,
        };
        this.getLocationDetails(position, 'handleSelect');
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
      });
  };

  onToggleOpen = () => {
    this.setState({
      isOpenInfo: false,
    });
  };

  handleMapInfo = () => {
    let mapInfo = {};
    const { mapSize, isMarker, markerPosition } = this.state;
    const { locationData } = this.props;
    if (locationData) {
      mapInfo = {
        isMarker,
        mapSize,
        lat: locationData.latitude,
        lng: locationData.longitude,
      };
    }
    if (!locationData && markerPosition) {
      mapInfo = {
        isMarker: true,
        mapSize: 15,
        lat: markerPosition.lat,
        lng: markerPosition.lng,
      };
    }
    return mapInfo;
  };

  onMarkerDragEnd = (event) => {
    const newLat = event.latLng.lat();
    const newLng = event.latLng.lng();
    Geocode.fromLatLng(newLat, newLng)
      .then((response) => {
        const address = response.results[0].formatted_address;
        const addressArray = response.results[0].address_components;
        const city = getCity(addressArray);
        const locality = getLocation(addressArray);
        const area = getArea(addressArray);
        const state = getStateName(addressArray);
        const location = { city, area, state, locality };
        const position = {
          latitude: newLat,
          longitude: newLng,
        };
        this.props.addressDetails(address, position, location);
        this.setState({
          address: address || '',
          markerPosition: {
            lat: newLat,
            lng: newLng,
          },
        });
      })
      .catch(() => {
        notification.error({ message: 'Failed to load the data.' });
      });
  };

  render() {
    const { address, markerAddress, isOpenInfo, GoogleMapsAPI } = this.state;
    const { isMarker, mapSize, lat, lng } = this.handleMapInfo();
    return (
      <ReloadMap
        id="loader"
        googleMapsApiKey={`${GoogleMapsAPI}&libraries=places`}
      >
        <div>
          <PlacesAutocomplete
            value={address}
            clearItemsOnError
            onChange={this.handleChange}
            onSelect={this.handleSelect}
          >
            {({
              getInputProps,
              suggestions,
              getSuggestionItemProps,
              loading,
            }) => (
              <div className="map-search" style={{ width: '100%' }}>
                <Input
                  {...getInputProps({ placeholder: 'Search Places' })}
                  defaultValue={address}
                />
                <Row className="map-list">
                  {loading && <div>Loading...</div>}
                  {suggestions.map((suggestion) => {
                    const colStyle = {
                      backgroundColor: suggestion.active ? '#eee' : '#fff',
                    };
                    return (
                      <Col
                        {...getSuggestionItemProps(suggestion, { colStyle })}
                      >
                        <Row className="suggestion_list">
                          {suggestion.description}
                        </Row>
                      </Col>
                    );
                  })}
                </Row>
              </div>
            )}
          </PlacesAutocomplete>
        </div>
        <GoogleMap
          id="map"
          mapContainerStyle={{
            height: '400px',
            width: '100%',
            borderRadius: '8px',
          }}
          zoom={mapSize}
          center={{ lat, lng }}
        >
          <Marker
            visible={isMarker}
            draggable
            onDragEnd={this.onMarkerDragEnd}
            onClick={() => this.getLocationDetails({ lat, lng })}
            position={{ lat, lng }}
          >
            {isOpenInfo && (
              <InfoWindow
                position={{ lat, lng }}
                onCloseClick={this.onToggleOpen}
              >
                <div style={divStyle}>
                  <p>{markerAddress}</p>
                </div>
              </InfoWindow>
            )}
          </Marker>
        </GoogleMap>
      </ReloadMap>
    );
  }
}

export default GoogleMaps;
