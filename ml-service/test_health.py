"""Health endpoint tests for production service monitoring."""

import unittest

from app import app, health_check


class HealthEndpointTests(unittest.TestCase):
    def test_health_endpoint_reports_service_status(self):
        paths = {route.path for route in app.routes}

        self.assertIn("/health", paths)
        self.assertEqual(health_check(), {"status": "ML service running"})
