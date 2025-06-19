# Ethiopian Passport Services Web Application

A Next.js web application for Ethiopian passport services that can automate multiple API requests for the same user with advanced automation features.

## Features

### Single User Processing
- Upload individual JSON user data files
- Submit appointment, request, and payment in sequence
- Auto-click functionality for rapid submissions
- Real-time status tracking and error handling

### Multiple API Automation (NEW!)
- **Automate 20+ API requests** for the same user with configurable count
- Sequential processing with rate limiting protection
- Real-time progress tracking and detailed results
- Comprehensive statistics and error reporting
- Maximum 100 API requests per automation session

## Technical Architecture

### Frontend
- **Next.js 14** with TypeScript
- **Chakra UI** for modern, responsive interface
- **Client-side validation** and error handling
- **Debounce protection** to prevent rapid multiple submissions

### Backend
- **Next.js API Routes** for server-side processing
- **Direct API integration** with Ethiopian passport services
- **Enhanced retry logic** with exponential backoff
- **CORS handling** and security headers
- **Sequential request management** for multiple API calls

### API Integration
- **Appointment API**: Schedule appointments with retry logic
- **Request API**: Submit passport requests with validation
- **Payment API**: Process payments with order tracking
- **Multiple Automation**: Handle sequential API requests for same user

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd yenesupass-web
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Single User Processing

1. **Prepare User Data**: Create a JSON file with user information:
```json
{
  "firstName": "Abebe",
  "middleName": "Kebede", 
  "lastName": "Tessema",
  "geezFirstName": "አበበ",
  "geezMiddleName": "ከበደ",
  "geezLastName": "ተሰማ",
  "birthDate": "1990-05-15",
  "gender": 1,
  "birthplace": "Addis Ababa",
  "phone": "0912345678",
  "email": "abebe@example.com"
}
```

2. **Upload and Process**: Use the single user form to upload and process

### Multiple API Automation (20+ Requests)

1. **Configure Request Count**: Set the number of API requests (1-100)
2. **Start Multiple Automation**: Upload the same user file and click "Submit X Requests"
3. **Monitor Progress**: Watch real-time progress and individual results

### Auto-Click Feature

- **5s Auto Click**: Rapid submissions for 5 seconds
- **10s Auto Click**: Extended rapid submissions for 10 seconds  
- **15s Auto Click**: Maximum rapid submissions for 15 seconds
- **Stop Auto Click**: Manually stop auto-clicking at any time

## API Endpoints

### Single Processing
- `POST /api/proxy` - Complete automation for single user

### Individual Endpoints
- `POST /api/schedule` - Submit appointment
- `POST /api/request` - Submit request
- `POST /api/payment` - Process payment

## Configuration

### Office Locations
The application supports multiple Ethiopian passport offices:

- **Addis Ababa** (ID: 24) - Main office
- **Hawassa** (ID: 28) - Sidama region
- **Dire Dawa** (ID: 34) - Dire Dawa region

### Request Count Settings
- **Default**: 20 API requests
- **Range**: 1-100 API requests
- **Recommendation**: Start with 20, increase gradually based on performance

## Error Handling

### Retry Logic
- **3 attempts** per request with exponential backoff
- **3-second delays** between requests to prevent rate limiting
- **Comprehensive error logging** for debugging

### Validation
- **Client-side validation** for required fields
- **Server-side validation** for data integrity
- **Individual error tracking** per API request

## Performance Features

### Multiple API Automation Advantages
- **Sequential processing** ensures reliable API communication
- **Rate limiting protection** prevents API overload
- **Progress tracking** shows real-time status
- **Detailed reporting** with success/failure statistics

### Optimization
- **Connection pooling** for efficient API calls
- **Request sequencing** to minimize conflicts
- **Memory management** for large automation sessions

## Security

- **CORS protection** with proper headers
- **Input validation** to prevent injection attacks
- **Rate limiting** to protect external APIs
- **Error sanitization** to prevent information leakage

## Monitoring

### Real-time Tracking
- **Progress indicators** for automation operations
- **Success/failure counts** with detailed breakdown
- **Processing time statistics** for optimization
- **Error details** for troubleshooting

### Logging
- **Console logging** for development debugging
- **Structured error reporting** for production monitoring
- **Performance metrics** for system optimization

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure you're using the Next.js API routes
2. **Rate Limiting**: Reduce request count or increase delays
3. **Validation Errors**: Check JSON format and required fields
4. **Network Timeouts**: Increase retry attempts or check connectivity

### Performance Tips

1. **Start with lower request count** (10-20) and increase gradually
2. **Monitor API response times** and adjust delays accordingly
3. **Use valid user data** to avoid processing errors
4. **Check network stability** for large automation sessions

## Development

### Project Structure
```
yenesupass-web/
├── app/
│   ├── api/           # Next.js API routes
│   ├── config/        # Configuration files
│   ├── services/      # API service classes
│   ├── types/         # TypeScript type definitions
│   └── page.tsx       # Main application page
├── public/            # Static assets
└── content.js         # Reference implementation
```

### Key Files
- `app/page.tsx` - Main UI with multiple automation
- `app/api/proxy/route.ts` - Single user automation API
- `app/services/direct-api.ts` - Direct API service
- `content.js` - Reference API implementation

## License

This project is for educational and development purposes. Please ensure compliance with Ethiopian passport service terms and conditions.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review console logs for error details
3. Verify JSON data format
4. Test with smaller request counts first