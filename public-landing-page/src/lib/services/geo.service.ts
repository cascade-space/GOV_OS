import axios from 'axios';

export const geoService = {
    // Reverse geocoding using Nominatim (OpenStreetMap)
    reverseGeocode: async (lat: number, lon: number) => {
        try {
            const response = await axios.get(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`
            );

            const { address, display_name } = response.data;

            // Determine ward from address details if possible
            // In a real app, you'd match these coords against ward boundary polygons
            const ward = address.suburb || address.neighbourhood || address.city_district || 'Unknown Ward';

            return {
                address: display_name,
                ward: ward,
                details: address
            };
        } catch (error) {
            console.error('Geocoding error:', error);
            return {
                address: 'Unable to retrieve address',
                ward: 'Unknown Ward'
            };
        }
    },

    // Mock function to determine priority based on location context
    // e.g. if near a hospital or school
    analyzeLocationContext: async (lat: number, lon: number) => {
        // In a production app, you'd use Overpass API or similar to check nearby POIs
        return {
            nearCriticalInfrastructure: false,
            nearSchool: false,
            nearHospital: false
        };
    }
};
