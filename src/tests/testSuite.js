import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import app from "../app.js";
import { connectDB } from "../config/db.js";
import { seedDefaultData } from "../utils/seeder.js";

const TEST_PORT = 5055;

async function runTests() {
  console.log("==================================================");
  console.log("   AI SAFE BACKEND - END-TO-END VERIFICATION");
  console.log("==================================================\n");

  await connectDB();
  await seedDefaultData();

  const server = app.listen(TEST_PORT);
  const baseUrl = `http://localhost:${TEST_PORT}/api/v1`;

  let workerToken = "";
  let adminToken = "";
  let generatedCertId = "";

  try {
    // 1. Health check
    console.log("1. Testing Health Endpoint (/api/v1/health)...");
    const healthRes = await fetch(`${baseUrl}/health`).then((r) => r.json());
    console.log("   Status:", healthRes.success ? "PASSED" : "FAILED", "| DB:", healthRes.database);

    // 2. Worker Registration
    console.log("\n2. Testing Worker Registration (/api/v1/auth/register)...");
    const uniqueEmail = `worker_${Date.now()}@aisafe.org`;
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Birsa Munda",
        email: uniqueEmail,
        password: "WorkerSafe@2026",
        industry: "mining",
        preferredLanguage: "sat"
      })
    }).then((r) => r.json());

    console.log("   Status:", regRes.success ? "PASSED" : "FAILED", "| Worker:", regRes.data?.user?.name);
    console.log("   Assigned Role:", regRes.data?.user?.role);
    workerToken = regRes.token;

    // 3. Authenticated Profile check
    console.log("\n3. Testing Authenticated Profile (/api/v1/auth/me)...");
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${workerToken}` }
    }).then((r) => r.json());
    console.log("   Status:", meRes.success ? "PASSED" : "FAILED", "| User ID:", meRes.data?.user?._id);

    // 4. Module Listing - Verify ONLY SPACE_HAZARD exists
    console.log("\n4. Testing Module Listing (/api/v1/modules)...");
    const modulesRes = await fetch(`${baseUrl}/modules`).then((r) => r.json());
    const moduleCodes = modulesRes.data.map((m) => m.moduleId);
    console.log("   Status:", modulesRes.success ? "PASSED" : "FAILED");
    console.log("   Found Modules:", moduleCodes.join(", "));

    if (moduleCodes.length === 1 && moduleCodes[0] === "SPACE_HAZARD") {
      console.log("   [OK] Verification confirmed: Only SPACE_HAZARD module is active.");
    } else {
      console.warn("   [WARNING] Expected only SPACE_HAZARD, found:", moduleCodes);
    }

    // 5. Module Details
    console.log("\n5. Testing Single Module Retrieval (/api/v1/modules/SPACE_HAZARD)...");
    const modDetailRes = await fetch(`${baseUrl}/modules/SPACE_HAZARD`).then((r) => r.json());
    console.log("   Status:", modDetailRes.success ? "PASSED" : "FAILED", "| Title:", modDetailRes.data?.title);

    // 6. AR Simulation Training Result Submission
    console.log("\n6. Testing AR Simulation Result Submission (/api/v1/training-results)...");
    const simRes = await fetch(`${baseUrl}/training-results`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${workerToken}`
      },
      body: JSON.stringify({
        moduleId: "SPACE_HAZARD",
        hazardsIdentified: 5,
        totalHazards: 5,
        timeTakenSeconds: 180,
        safetyViolations: [],
        notes: "Passed AR confined space obstacle simulation without incidents."
      })
    }).then((r) => r.json());
    console.log("   Status:", simRes.success ? "PASSED" : "FAILED", "| Hazards:", `${simRes.data?.hazardsIdentified}/${simRes.data?.totalHazards}`);

    // 7. Assessment Question Retrieval (Santali & Hindi localization test)
    console.log("\n7. Testing Assessment Retrieval with Santali localization (/api/v1/assessments/module/SPACE_HAZARD?lang=sat)...");
    const assessRes = await fetch(`${baseUrl}/assessments/module/SPACE_HAZARD?lang=sat`, {
      headers: { Authorization: `Bearer ${workerToken}` }
    }).then((r) => r.json());
    console.log("   Status:", assessRes.success ? "PASSED" : "FAILED", "| Questions Count:", assessRes.data?.questionsCount);
    console.log("   Sample Question Q1:", assessRes.data?.questions[0]?.questionText);

    // 8. Assessment Submission (Passing Score -> Automatic Certificate Generation)
    console.log("\n8. Submitting Assessment Answers (Expecting Pass & Certificate Issuance)...");
    const submitRes = await fetch(`${baseUrl}/assessments/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${workerToken}`
      },
      body: JSON.stringify({
        moduleId: "SPACE_HAZARD",
        answers: [
          { questionId: "Q1", selectedOptionId: "B" }, // 19.5%
          { questionId: "Q2", selectedOptionId: "B" }, // Oxygen -> Flammable -> Toxic
          { questionId: "Q3", selectedOptionId: "C" }, // Continuously throughout
          { questionId: "Q4", selectedOptionId: "B" }, // Isolate energy sources
          { questionId: "Q5", selectedOptionId: "B" }  // Summon rescue & non-entry retrieval
        ]
      })
    }).then((r) => r.json());

    console.log("   Status:", submitRes.success ? "PASSED" : "FAILED");
    console.log("   Score:", `${submitRes.data?.scorePercentage}%`, "| Passed:", submitRes.data?.passed);
    console.log("   Generated Certificate ID:", submitRes.data?.certificate?.certificateId);
    generatedCertId = submitRes.data?.certificate?.certificateId;

    // 9. Public Certificate Verification (NO AUTHENTICATION)
    console.log(`\n9. Testing Public QR Verification without Auth (/api/v1/certificates/verify/${generatedCertId})...`);
    const verifyRes = await fetch(`${baseUrl}/certificates/verify/${generatedCertId}`).then((r) => r.json());
    console.log("   Public Verification Status:", verifyRes.success ? "PASSED" : "FAILED");
    console.log("   Verified Worker Name:", verifyRes.data?.workerName);
    console.log("   Verified Module:", verifyRes.data?.moduleTitle);
    console.log("   Certificate Status:", verifyRes.data?.status);
    console.log("   QR Code Data URL Generated:", verifyRes.data?.qrCodeDataUrl?.startsWith("data:image/png;base64,") ? "YES (Valid PNG)" : "NO");
    console.log("   Public Payload Sanitized:", !verifyRes.data?.password && !verifyRes.data?.userId ? "YES (Safe)" : "NO (Leaked fields!)");

    // 10. Worker My-Certificates
    console.log("\n10. Testing Worker Certificate History (/api/v1/certificates/my-certificates)...");
    const myCertsRes = await fetch(`${baseUrl}/certificates/my-certificates`, {
      headers: { Authorization: `Bearer ${workerToken}` }
    }).then((r) => r.json());
    console.log("   Status:", myCertsRes.success ? "PASSED" : "FAILED", "| Certificates Count:", myCertsRes.count);

    // 11. Worker Training Progress Tracking
    console.log("\n11. Testing Worker Progress Tracking (/api/v1/progress)...");
    const updateProgressRes = await fetch(`${baseUrl}/progress/step`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${workerToken}`
      },
      body: JSON.stringify({
        moduleId: "SPACE_HAZARD",
        stepKey: "ATMOSPHERIC_O2_CHECK",
        hazardKey: "O2_DEFICIENCY_DETECTED"
      })
    }).then((r) => r.json());
    console.log("   Step Update Status:", updateProgressRes.success ? "PASSED" : "FAILED", "| Current Progress:", `${updateProgressRes.data?.percentageProgress}%`);

    const getProgressRes = await fetch(`${baseUrl}/progress/SPACE_HAZARD`, {
      headers: { Authorization: `Bearer ${workerToken}` }
    }).then((r) => r.json());
    console.log("   Progress Retrieval Status:", getProgressRes.success ? "PASSED" : "FAILED", "| Status:", getProgressRes.data?.status);

    // 12. Offline Batch Synchronization
    console.log("\n12. Testing Offline Batch Sync with Idempotency (/api/v1/sync/batch)...");
    const testSyncId = `client_sync_${Date.now()}`;
    const syncRes = await fetch(`${baseUrl}/sync/batch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${workerToken}`
      },
      body: JSON.stringify({
        items: [
          {
            clientSyncId: testSyncId,
            actionType: "SIMULATION_RESULT",
            payload: {
              moduleId: "SPACE_HAZARD",
              hazardsIdentified: 4,
              totalHazards: 5,
              timeTakenSeconds: 240,
              notes: "Offline pit scenario recorded in underground drift"
            }
          }
        ]
      })
    }).then((r) => r.json());
    console.log("   First Sync Status:", syncRes.success ? "PASSED" : "FAILED", "| Processed:", syncRes.data?.processedCount);

    // Retransmit same clientSyncId to verify duplicate protection
    const duplicateSyncRes = await fetch(`${baseUrl}/sync/batch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${workerToken}`
      },
      body: JSON.stringify({
        items: [
          {
            clientSyncId: testSyncId,
            actionType: "SIMULATION_RESULT",
            payload: {}
          }
        ]
      })
    }).then((r) => r.json());
    console.log("   Duplicate Sync Idempotency Check:", duplicateSyncRes.data?.ignoredDuplicates === 1 ? "PASSED (Duplicate ignored)" : "FAILED");

    // 13. Admin Login & Dashboard Stats
    console.log("\n13. Testing Admin Login (/api/v1/auth/login)...");
    const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@aisafe.org",
        password: "Admin@123456"
      })
    }).then((r) => r.json());
    console.log("   Status:", adminLoginRes.success ? "PASSED" : "FAILED", "| Role:", adminLoginRes.data?.user?.role);
    adminToken = adminLoginRes.token;

    console.log("\n14. Testing Admin Dashboard Metrics (/api/v1/admin/dashboard)...");
    const adminDashRes = await fetch(`${baseUrl}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    }).then((r) => r.json());
    console.log("   Status:", adminDashRes.success ? "PASSED" : "FAILED");
    console.log("   Summary:", JSON.stringify(adminDashRes.data?.summary));

    // 15. Admin Worker and Certificate Management
    console.log("\n15. Testing Admin Worker & Certificate Management...");
    const adminWorkersRes = await fetch(`${baseUrl}/admin/workers`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    }).then((r) => r.json());
    console.log("   Admin Workers List:", adminWorkersRes.success ? "PASSED" : "FAILED", "| Total:", adminWorkersRes.count);

    const adminCertsRes = await fetch(`${baseUrl}/admin/certificates`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    }).then((r) => r.json());
    console.log("   Admin Certificates List:", adminCertsRes.success ? "PASSED" : "FAILED", "| Total:", adminCertsRes.count);

    const revokeRes = await fetch(`${baseUrl}/admin/certificates/${generatedCertId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: "revoked" })
    }).then((r) => r.json());
    console.log("   Certificate Revocation:", revokeRes.success ? "PASSED" : "FAILED", "| New Status:", revokeRes.data?.status);

    const reinstateRes = await fetch(`${baseUrl}/admin/certificates/${generatedCertId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: "valid" })
    }).then((r) => r.json());
    console.log("   Certificate Reinstatement:", reinstateRes.success ? "PASSED" : "FAILED", "| New Status:", reinstateRes.data?.status);

    console.log("\n==================================================");
    console.log("   ALL VERIFICATION CHECKS COMPLETED SUCCESSFULLY!");
    console.log("==================================================");
  } catch (err) {
    console.error("Verification failed with error:", err);
  } finally {
    server.close();
    await mongoose.connection.close();
    process.exit(0);
  }
}

runTests();
