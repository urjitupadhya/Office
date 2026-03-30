"use client";

import React, { useState } from "react";
import { hospitalScene } from "@/data/hospitalScene";

type HospitalSceneProps = {
  patientCount: number;
  patients?: Array<{
    id: string;
    login: string;
    avatarUrl: string;
    lastCommitAt: string;
    commits: number;
    status: 'critical' | 'warning' | 'stable';
    problem: string;
  }>;
};

export function HospitalScene({ patientCount, patients = [] }: HospitalSceneProps) {
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(45);
  const [combo, setCombo] = useState(0);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [currentPatients, setCurrentPatients] = useState<any[]>(patients);
  const [showProblemDetails, setShowProblemDetails] = useState<any>(null);

  const visiblePatients = hospitalScene.patientPlacements.slice(
    0,
    Math.max(0, Math.min(patientCount, hospitalScene.maxPatients)),
  );

  // Merge scene data with patient data
  const enhancedPatients = visiblePatients.map((placement, index) => {
    const patientData = currentPatients.find(p => p.id === placement.id);
    return {
      ...placement,
      ...patientData,
      status: patientData?.status || 'critical',
      problem: patientData?.problem || 'CI/CD Pipeline Failure',
      points: patientData?.status === 'critical' ? 150 : patientData?.status === 'warning' ? 75 : 25
    };
  });

  const handlePatientClick = (patientId: string) => {
    const patientIndex = enhancedPatients.findIndex(p => p.id === patientId);
    const patient = enhancedPatients[patientIndex];
    if (!patient) return;

    // Show problem details popup first
    setShowProblemDetails({
      ...patient,
      index: patientIndex
    });
    
    setSelectedPatient(patientId);
  };

  const handleFixProblem = () => {
    if (!showProblemDetails) return;
    
    const patient = showProblemDetails;
    const points = patient.points || 100;
    
    setScore(prev => prev + points + (combo * 10));
    setCombo(prev => prev + 1);
    setHealth(prev => Math.min(100, prev + 5));
    
    console.log(`Fixed ${patient.label}: ${patient.problem} - +${points} points!`);
    
    // Update the patient status to 'stable' after the fix
    setTimeout(() => {
      setSelectedPatient(null);
      setShowProblemDetails(null);
      
      // Update the patients array to reflect the fix
      const updatedPatients = [...enhancedPatients];
      updatedPatients[patient.index] = {
        ...updatedPatients[patient.index],
        status: 'stable',
        problem: 'All Systems Operational'
      };
      
      // This will trigger a re-render with the updated patient status
      setCurrentPatients(updatedPatients);
    }, 1500);
  };

  return (
    <>
      <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>
      {/* Game HUD */}
      <div style={{
        position: "absolute",
        top: 10,
        left: 10,
        zIndex: 100,
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "10px 15px",
        borderRadius: 8,
        fontSize: 12,
        border: "2px solid #4ade80"
      }}>
        <div>🏥 Score: {score}</div>
        <div>❤️ Health: {health}%</div>
        <div>⚡ Combo: x{combo}</div>
      </div>

      <div
        style={{
          position: "relative",
          width: "100%",
          overflow: "hidden",
          aspectRatio: hospitalScene.aspectRatio,
          borderRadius: 18,
          background:
            "linear-gradient(180deg, rgba(241,247,252,1), rgba(217,229,238,0.98))",
          boxShadow: "0 18px 42px rgba(0, 0, 0, 0.22)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={hospitalScene.backgroundSrc}
          alt={hospitalScene.title}
          draggable={false}
          style={{
            pointerEvents: "none",
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            userSelect: "none",
            imageRendering: "pixelated",
          }}
        />

        {/* Clinic Info Panel */}
        <div
          style={{
            position: "absolute",
            left: 18,
            top: 18,
            zIndex: 10,
            maxWidth: 300,
            borderRadius: 16,
            border: "1px solid rgba(40, 74, 96, 0.18)",
            background: "rgba(246, 251, 255, 0.92)",
            boxShadow: "0 10px 28px rgba(34, 65, 83, 0.12)",
            padding: "12px 14px",
            color: "#224153",
          }}
        >
          <p
            style={{
              fontSize: 11,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              opacity: 0.7,
            }}
          >
            Clinic View
          </p>
          <p style={{ marginTop: 4, fontSize: 18, fontWeight: 700 }}>
            {hospitalScene.title}
          </p>
          <p style={{ marginTop: 6, fontSize: 12, lineHeight: 1.5, opacity: 0.8 }}>
            {enhancedPatients.length} of {hospitalScene.maxPatients} beds occupied
          </p>
          <p style={{ marginTop: 4, fontSize: 10, color: health > 70 ? '#4ade80' : health > 40 ? '#facc15' : '#f87171' }}>
            Hospital Status: {health > 70 ? '🟢 Healthy' : health > 40 ? '🟡 Warning' : '🔴 Critical'}
          </p>
        </div>

        {/* Interactive Patient Beds */}
        {enhancedPatients.map((patient, index) => (
          <div
            key={patient.id}
            title={`${patient.label} - ${patient.problem}`}
            style={{
              position: "absolute",
              left: `${patient.left}%`,
              top: `${patient.top}%`,
              width: `${patient.width}%`,
              height: `${patient.height}%`,
              zIndex: patient.zIndex,
              filter: patient.status === 'critical' ? 'drop-shadow(0 0 10px rgba(248, 113, 113, 0.8))' : 
                       patient.status === 'warning' ? 'drop-shadow(0 0 6px rgba(250, 204, 21, 0.6))' : 
                       'drop-shadow(0 4px 6px rgba(34, 65, 83, 0.12))',
              cursor: patient.status !== 'stable' ? 'pointer' : 'default',
              transform: selectedPatient === patient.id ? 'scale(1.1)' : 'scale(1)',
              transition: 'all 0.2s ease',
            }}
            onClick={() => handlePatientClick(patient.id)}
          >
            <div
              className="seat-bob"
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                animationDelay: `${index * 140}ms`,
              }}
            >
              {/* Patient Status Indicator */}
              {patient.status === 'critical' && (
                <div style={{
                  position: 'absolute',
                  top: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 16,
                  animation: 'pulse 1s infinite'
                }}>🚨</div>
              )}
              
              {patient.status === 'warning' && (
                <div style={{
                  position: 'absolute',
                  top: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 16,
                  animation: 'pulse 2s infinite'
                }}>⚠️</div>
              )}

              {/* Patient Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={patient.contributor?.avatarUrl || hospitalScene.patientSpriteSrc}
                alt={patient.label}
                draggable={false}
                style={{
                  transform: patient.rotation !== undefined ? `rotate(${patient.rotation}deg)` : "rotate(90deg)",
                  transformOrigin: "center",
                  pointerEvents: "none",
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  userSelect: "none",
                  imageRendering: "pixelated",
                  filter: selectedPatient === patient.id ? 'brightness(1.2) hue-rotate(20deg)' : 'none',
                }}
              />
              
              {/* Points Popup */}
              {selectedPatient === patient.id && (
                <div style={{
                  position: 'absolute',
                  top: -30,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(0,0,0,0.9)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 'bold',
                  zIndex: 1000,
                  animation: 'fadeInOut 2s ease'
                }}>
                  {patient.status === 'stable' ? '✅ Fixed!' : `+${patient.points} points!`}
                </div>
              )}
              
              {/* Fixed Indicator */}
              {patient.status === 'stable' && (
                <div style={{
                  position: 'absolute',
                  top: -5,
                  right: -5,
                  fontSize: 10,
                  color: '#4ade80',
                  fontWeight: 'bold',
                  zIndex: 1001
                }}>✅</div>
              )}
            </div>
          </div>
        ))}
      </div>
      </div>

      {/* CI/CD Problem Details Popup */}
    {showProblemDetails && (
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'rgba(0,0,0,0.95)',
        color: 'white',
        padding: '20px',
        borderRadius: 12,
        zIndex: 2000,
        minWidth: '300px',
        maxWidth: '400px',
        border: `2px solid ${showProblemDetails.status === 'critical' ? '#f87171' : showProblemDetails.status === 'warning' ? '#facc15' : '#4ade80'}`
      }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: 18 }}>
          🏥 CI/CD Diagnosis Report
        </h3>
        
        <div style={{ marginBottom: 15 }}>
          <div style={{ fontSize: 14, opacity: 0.8 }}>Patient:</div>
          <div style={{ fontSize: 16, fontWeight: 'bold' }}>
            {showProblemDetails.contributor?.login || 'Unknown'} - {showProblemDetails.label}
          </div>
        </div>
        
        <div style={{ marginBottom: 15 }}>
          <div style={{ fontSize: 14, opacity: 0.8 }}>Status:</div>
          <div style={{ 
            fontSize: 16, 
            fontWeight: 'bold',
            color: showProblemDetails.status === 'critical' ? '#f87171' : 
                   showProblemDetails.status === 'warning' ? '#facc15' : '#4ade80'
          }}>
            {showProblemDetails.status.toUpperCase()}
          </div>
        </div>
        
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, opacity: 0.8 }}>CI/CD Issue:</div>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: '#fbbf24' }}>
            {showProblemDetails.problem}
          </div>
          {showProblemDetails.details && (
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6, lineHeight: 1.5 }}>
              {showProblemDetails.details}
            </div>
          )}
        </div>

        {showProblemDetails.ciCdAnalysis && (
          <div style={{
            marginBottom: 20,
            padding: '10px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 8,
            fontSize: 12,
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: 8, opacity: 0.9 }}>📊 Repo CI/CD Health</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              <div>Build: <span style={{ color: showProblemDetails.ciCdAnalysis.buildStatus === 'failing' ? '#f87171' : showProblemDetails.ciCdAnalysis.buildStatus === 'passing' ? '#4ade80' : '#9ca3af' }}>{showProblemDetails.ciCdAnalysis.buildStatus}</span></div>
              <div>Tests: <span style={{ color: showProblemDetails.ciCdAnalysis.testCoverage < 30 ? '#f87171' : '#4ade80' }}>{showProblemDetails.ciCdAnalysis.testCoverage.toFixed(0)}%</span></div>
              <div>Deploy: <span style={{ color: showProblemDetails.ciCdAnalysis.lastDeployment ? '#4ade80' : '#f87171' }}>{showProblemDetails.ciCdAnalysis.lastDeployment ? 'Active' : 'None'}</span></div>
              <div>Failures: <span style={{ color: showProblemDetails.ciCdAnalysis.workflowFailures > 0 ? '#f87171' : '#4ade80' }}>{showProblemDetails.ciCdAnalysis.workflowFailures}</span></div>
              <div>Security: <span style={{ color: showProblemDetails.ciCdAnalysis.securityIssues > 0 ? '#f87171' : '#4ade80' }}>{showProblemDetails.ciCdAnalysis.securityIssues}</span></div>
              <div>Deps: <span style={{ color: showProblemDetails.ciCdAnalysis.dependencyIssues > 5 ? '#facc15' : '#4ade80' }}>{showProblemDetails.ciCdAnalysis.dependencyIssues}</span></div>
            </div>
          </div>
        )}
        
        {showProblemDetails.status !== 'stable' && (
          <div style={{ marginBottom: 15 }}>
            <div style={{ fontSize: 14, opacity: 0.8 }}>Points for fixing:</div>
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#4ade80' }}>
              +{showProblemDetails.points} points
            </div>
          </div>
        )}
        
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          {showProblemDetails.status !== 'stable' ? (
            <>
              <button
                onClick={() => setShowProblemDetails(null)}
                style={{
                  padding: '8px 16px',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleFixProblem}
                style={{
                  padding: '8px 16px',
                  background: '#4ade80',
                  color: 'black',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                🚑 Fix Issue (+{showProblemDetails.points} pts)
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowProblemDetails(null)}
              style={{
                padding: '8px 16px',
                background: '#4ade80',
                color: 'black',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ✅ Already Healthy
            </button>
          )}
        </div>
      </div>
    )}
    
    {/* Background overlay for popup */}
    {showProblemDetails && (
      <div 
        onClick={() => setShowProblemDetails(null)}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 1999
        }}
      />
    )}
    </>
  );
}
