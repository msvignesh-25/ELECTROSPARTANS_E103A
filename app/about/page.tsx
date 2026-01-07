export const metadata = {
  title: 'About Us - Business Growth Assistant',
  description: 'Learn about our mission to help small and family-run shops grow their business with AI-powered strategies.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
          About Us
        </h1>
        
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">
            Welcome to the <strong>Business Growth Assistant</strong> - an AI-powered platform 
            designed specifically to help managers and owners of small and family-run shops that 
            have low visibility and limited resources.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
            Our Mission
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            We understand that running a small business comes with unique challenges. Limited budgets, 
            time constraints, and small teams make it difficult to compete with larger businesses. 
            Our mission is to provide realistic, resource-aware growth strategies that respect your 
            constraints and help you grow sustainably.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
            What We Do
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            Our AI-powered assistant analyzes your specific situation - including your budget, available 
            time, team size, and growth goals - to provide personalized recommendations. We focus on:
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2 ml-4">
            <li>Realistic advertising and discovery methods tailored to your resources</li>
            <li>Clear separation between automated, AI-assisted, and human-only tasks</li>
            <li>Actionable weekly plans you can actually follow</li>
            <li>Optional collaboration and fundraising ideas when appropriate</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
            Our Approach
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            We believe in honest, transparent guidance. We don't overpromise results or force paid 
            advertising. Instead, we provide practical strategies that work within your means. Every 
            recommendation is optional, and all final decisions remain with you - the business owner.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
            Who We Serve
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            Our platform is designed for small businesses, family-run shops, local stores, and 
            entrepreneurs who want to grow but need strategies that respect their limited resources. 
            Whether you're looking to increase visibility, boost sales, or plan for expansion, 
            we're here to help.
          </p>

          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
            <p className="text-blue-800 dark:text-blue-300 font-semibold mb-2">
              Remember:
            </p>
            <p className="text-blue-700 dark:text-blue-400 text-sm">
              Our AI assistant provides guidance based on your inputs. All final decisions about 
              your business remain with you. Results may vary based on your local market, competition, 
              and execution quality. Always consider what feels right for your business and customers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
