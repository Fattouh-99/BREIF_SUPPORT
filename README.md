## License

This project is licensed for educational use only. For commercial use, a license must be purchased. You can obtain the license here: [Code License](https://webprodigies.com/license).

## Usage Guidelines

Here are a few examples of how you can and cannot use the code:

- **To learn?** ✅
- **To build a portfolio?** ✅
- **To get a job?** ✅
- **To run as a business?** ❌
- **To run as a SaaS?** ❌
- **Any form of income through the code?** ❌
- **To resell?** ❌
- **To create content?** ❌
- **To claim as your own?** ❌

These are just a few examples, and there may be more situations where the code usage is restricted you can read the agreement on the website.
This code is provided strictly for learning purposes. If you wish to use our code for any commercial purposes, please purchase a license here: [Code License](https://webprodigies.com/license).


## Maintenance and Operations Guide

### Table of Contents

1. [Maintenance Procedures](#maintenance-procedures)
2. [Database Management](#database-management)
3. [Monitoring and Health Checks](#monitoring-and-health-checks)
4. [Deployment](#deployment)
5. [Troubleshooting](#troubleshooting)

## Maintenance Procedures

### Enabling Maintenance Mode

To put the site into maintenance mode for updates without disrupting users:

1. Log in as a super admin
2. Navigate to the Admin settings
3. In the System Settings section, toggle "Maintenance Mode" on
4. Enter a maintenance message to display to users
5. Click "Save Changes"

When maintenance mode is enabled, only super admins can access the site. All other users will see the maintenance message.

### Scheduled Maintenance

For planned maintenance:

1. Notify users 24 hours in advance through email or in-app notifications
2. Run the pre-deployment script: `./scripts/maintenance/pre-deploy.sh [environment]`
3. Enable maintenance mode
4. Perform the maintenance or update
5. Test the application
6. Disable maintenance mode
7. Monitor the application for any issues

## Database Management

### Backup Procedures

The system includes automated backup scripts in the `scripts/maintenance` directory:

#### Creating Backups

To create a backup manually:

```bash
./scripts/maintenance/backup-database.sh [environment]
```

This will create a timestamped backup in the `backups/[environment]` directory.

#### Restoring Backups

To restore from a backup:

```bash
./scripts/maintenance/restore-database.sh [backup_file] [environment]
```

### Database Migrations

When deploying schema changes:

1. Always back up the database first
2. Test migrations on a staging environment
3. Check for pending migrations: `npx prisma migrate status`
4. Apply migrations: `npx prisma migrate deploy`

## Monitoring and Health Checks

### Health Check Endpoint

The application provides a health check endpoint at `/api/health` that returns the current system status.

- Basic health: `GET /api/health`
- Detailed health: `GET /api/health?detailed=true`

### System Monitoring

The application includes built-in monitoring for:

- API request metrics
- Database connection status
- System resource usage (CPU, memory)

To enable resource monitoring, set `ENABLE_RESOURCE_MONITORING=true` in your environment variables.

## Deployment

### Pre-Deployment Checklist

Run the pre-deployment script to handle routine checks and backups:

```bash
./scripts/maintenance/pre-deploy.sh [environment]
```

This script:
1. Creates a database backup
2. Checks for pending database migrations
3. Runs tests
4. Builds the application
5. Prepares environment configuration

### Deployment Process

1. Run pre-deployment script
2. Enable maintenance mode
3. Deploy new code
4. Apply database migrations
5. Run smoke tests
6. Disable maintenance mode
7. Monitor application

## Troubleshooting

### Common Issues

#### Database Connection Errors

1. Check database health: `GET /api/health?detailed=true`
2. Verify database credentials in environment variables
3. Ensure database server is running

#### Performance Issues

1. Check system resources via the health endpoint
2. Review logs for errors or warnings
3. Consider scaling resources if consistently at high utilization

## Authentication

This application uses Clerk as the authentication provider, but with a custom UI. The authentication flow works as follows:

1. Custom sign-in and sign-up forms are used for the user interface
2. These forms connect to Clerk's authentication APIs in the background 
3. Form validation and security measures like throttling and lockouts are handled by our custom code
4. The actual authentication (creating users, verifying credentials, etc.) is handled by Clerk

### Pages
- `/auth/sign-in` - Custom login page
- `/auth/sign-up` - Custom registration page

## Stripe Configuration

This application includes subscription billing powered by Stripe. To enable all billing features, you need to configure several settings in your Stripe dashboard.

### Required Environment Variables

Ensure these environment variables are set in your `.env.local`:

```env
STRIPE_SECRET=sk_test_...  # Your Stripe secret key
NEXT_PUBLIC_STRIPE_PUBLISH_KEY=pk_test_...  # Your Stripe publishable key
STRIPE_PRO_PRICE_ID=price_...  # Price ID for Pro plan
STRIPE_ULTIMATE_PRICE_ID=price_...  # Price ID for Ultimate plan
```

### Setting Up the Customer Portal

The billing management feature requires configuring Stripe's Customer Portal:

1. **Go to Stripe Dashboard**: Navigate to [Customer Portal Settings](https://dashboard.stripe.com/test/settings/billing/portal)

2. **Configure Business Information**:
   - Add your business name
   - Add your website URL
   - Upload your business logo (optional)
   - Set your support contact information

3. **Configure Customer Information**:
   - Choose what customer details can be updated (email, billing address, etc.)

4. **Configure Subscription Settings**:
   - Enable "Allow customers to cancel subscriptions"
   - Enable "Allow customers to update subscriptions" (optional)
   - Set cancellation behavior (immediate vs. end of period)

5. **Configure Payment Methods**:
   - Enable "Allow customers to update payment methods"
   - Choose which payment method types to support

6. **Save Configuration**: Click "Save configuration" at the bottom

### Setting Up Products and Prices

Create your subscription products in Stripe:

1. Go to [Products](https://dashboard.stripe.com/test/products) in your Stripe dashboard
2. Create products for each plan (Pro, Ultimate)
3. For each product, create a recurring price
4. Copy the price IDs and add them to your environment variables

### Common Issues

#### "No configuration provided" Error

If you see this error when clicking "Manage Billing":

```
Error: No configuration provided and your test mode default configuration has not been created.
```

This means the Customer Portal hasn't been configured yet. Follow the "Setting Up the Customer Portal" steps above.

#### CORS Errors with Customer Portal

If you encounter CORS errors like:
```
Access to fetch at 'https://r.stripe.com/b' from origin 'https://billing.stripe.com' has been blocked by CORS policy
```

**Solutions:**

1. **Set NEXT_PUBLIC_APP_URL**: Add this to your `.env.local`:
   ```env
   NEXT_PUBLIC_APP_URL=http://localhost:3000  # For development
   NEXT_PUBLIC_APP_URL=https://yourdomain.com  # For production
   ```

2. **Configure Return URL in Stripe Dashboard**:
   - Go to [Customer Portal Settings](https://dashboard.stripe.com/test/settings/billing/portal)
   - In the "Business information" section, set your website URL to match your `NEXT_PUBLIC_APP_URL`
   - Save the configuration

3. **Clear Browser Cache**: Clear your browser cache and cookies, then try again

4. **Check Domain Configuration**: Ensure your domain is properly configured in Stripe dashboard

5. **For Local Development**: If using localhost, make sure you're accessing via the same port consistently

6. **Try Different Browser**: Test in an incognito/private window to rule out browser-specific issues

#### Missing Price IDs

If subscriptions fail to create, verify that:
- Your `STRIPE_PRO_PRICE_ID` and `STRIPE_ULTIMATE_PRICE_ID` are correctly set
- The price IDs exist in your Stripe account
- The prices are set to "recurring" billing

### Testing

To test the billing functionality:
1. Use Stripe's test card numbers (e.g., `4242424242424242`)
2. All webhooks and portal functionality work in test mode
3. No real charges will be made in test mode

## Vercel Deployment

### Prerequisites

Before deploying to Vercel, ensure you have:

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Git repository with your project (GitHub, GitLab, or Bitbucket)
3. All required environment variables ready

### Environment Variables

Set up the following environment variables in your Vercel project:

```
# Database
DATABASE_URL=your_database_connection_string

# Next.js
NEXT_PUBLIC_APP_URL=https://your-vercel-deployment-url.vercel.app
NEXT_RUNTIME=nodejs

# Clerk Authentication (if used)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Stripe (if used)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### Deployment Steps

1. **Connect Your Repository**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" > "Project"
   - Select your Git repository
   - Configure project settings

2. **Configure Build Settings**:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Set Environment Variables**:
   - Add all required environment variables listed above
   - For sensitive variables, use Vercel's environment variable encryption

4. **Deploy**:
   - Click "Deploy"
   - Vercel will clone your repository, install dependencies, build your project, and deploy it

### Post-Deployment

After successful deployment:

1. **Set Up Custom Domain** (optional):
   - Go to your project settings in Vercel
   - Navigate to "Domains"
   - Add your custom domain and follow the verification steps

2. **Configure Webhooks**:
   - Update webhook URLs in services like Stripe, Clerk, etc., to point to your Vercel deployment

3. **Run Database Migrations**:
   - If your application uses Prisma, run migrations using Vercel CLI or deployment hooks

### Continuous Deployment

Vercel automatically deploys when you push changes to your repository. To customize this behavior:

1. **Configure Git Branch Deployments**:
   - Go to your project settings
   - Navigate to "Git"
   - Configure which branches should trigger production vs. preview deployments

2. **Set Up Preview Environments**:
   - By default, Vercel creates preview deployments for pull requests
   - These can be customized in your project settings

### Troubleshooting Vercel Deployments

If you encounter issues with your Vercel deployment:

1. **Check Build Logs**:
   - Go to your project in the Vercel dashboard
   - Click on the latest deployment
   - Review the build logs for errors

2. **Verify Environment Variables**:
   - Ensure all required environment variables are set correctly
   - Check for typos or missing variables

3. **Check for Unsupported Features**:
   - Ensure your project doesn't use features not supported by Vercel
   - Examples include certain server configurations or file system operations

4. **Review Resource Limits**:
   - Verify your project doesn't exceed Vercel's free tier limits (if applicable)
   - Consider upgrading if you need more resources
