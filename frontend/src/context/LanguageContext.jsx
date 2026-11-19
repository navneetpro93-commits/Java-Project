import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LanguageContext = createContext();

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

// Comprehensive initial dictionary for instant, crisp rendering
const BASE_DICTIONARIES = {
  en: {
    // Brand & Status
    brandSubtitle: 'Smart Banking & Real-Time Fraud Protection',
    liveNetwork: 'Live Network',
    disconnected: 'Disconnected',
    engineClock: 'Engine Clock',
    tick: 'Tick',
    syncData: 'Sync Data',
    signOut: 'Sign Out',
    activeVerified: 'Active & Verified',
    connectedAccounts: 'Connected Accounts',
    
    // Navigation Tabs
    navOverview: 'Overview',
    navTransfers: 'Transfers & Pay',
    navVault: 'Safety Vault',
    navLedger: 'Audit Ledger',
    navSpending: 'Spending Intel',
    navGoals: 'Savings Goals',
    navStressLab: 'Stress Test Lab',

    // Dashboard Overview
    welcomeBack: 'Welcome back',
    depositFunds: 'Deposit Funds',
    sendMoney: 'Send Money',
    openAccount: 'Open Account',
    totalLiquidBalance: 'Total Liquid Balance',
    acrossAllAccounts: 'Across all connected accounts',
    safetyVaultLocked: 'Safety Vault Locked',
    autoSavingsRoundups: 'Auto-savings & micro-roundups',
    pendingReview: 'Pending Review',
    transactionsInCooldown: 'Transactions in Cooldown Vault',
    fraudShieldStatus: 'Fraud Shield Status',
    allSecured: 'Secured',
    locked: 'Locked',
    automatedHeuristics: 'Automated heuristics active',
    yourAccountsCards: 'Your Accounts & Cards',
    availableBalance: 'Available Balance',
    vaultSavings: 'Vault Savings',
    annualYield: 'Annual Yield',
    overdraftFacility: 'Overdraft Facility',
    totalCreditLimit: 'Total Credit Limit',
    auditLedger: 'Audit Ledger',
    transfer: 'Transfer',
    unlockAccount: 'Unlock Account',
    lockAccount: 'Lock Account',

    // Transfers
    transfersTitle: 'Transfers & Instant Payments',
    transfersSubtitle: 'Instant multi-channel clearing protected by automated fraud risk evaluation.',
    debitAccount: 'Debit Account',
    creditAccount: 'Credit Account',
    beneficiaryAccount: 'Beneficiary Account',
    amount: 'Amount',
    categoryNote: 'Payment Category & Description',
    highValueAlert: 'Fraud Protection Notice: High-value transfers (≥ ₹25,000) are routed through the Cooldown Vault for review.',
    authorize: 'Authorize',
    clearingTransaction: 'Clearing Transaction...',
    settledSuccess: 'Transaction Settled Successfully',
    placedInHold: 'Placed in Safety Hold (Cooldown)',
    blockedByFraud: 'Transaction Blocked by Fraud Shield',

    // Safety Vault
    vaultTitle: 'Safety Vault & Hold Queue',
    vaultSubtitle: 'Suspicious or high-value transfers are paused here for a cooling period, giving you time to cancel unauthorized debits.',
    cancelAndRecall: 'Cancel & Recall',
    holdQueueClear: 'Hold Queue is Clear',
    ticksRemaining: 'ticks remaining',

    // Statements
    ledgerTitle: 'Audit Ledger & Statements',
    ledgerSubtitle: 'Complete transaction statements with risk scores and verified status.',
    searchPlaceholder: 'Search category, payee, note...',
    sortByDate: 'Sort by Date',
    sortByAmount: 'Sort by Amount',
    sortByRisk: 'Sort by Risk Score',

    // Spending Intel
    spendingTitle: 'Spending Analytics & Financial Persona',
    spendingSubtitle: 'Automated expenditure classification and monthly budget monitoring.',
    financialPersona: 'Financial Persona',
    totalExpenditure: 'Total Expenditure (Debits)',
    autoSavedInVault: 'Auto-Saved in Vault',
    monthlyCategoryBudgets: 'Monthly Category Budgets vs Spending',

    // Savings Goals
    savingsGoalsTitle: 'Savings Goals & Milestones',
    savingsGoalsSubtitle: 'Automated 8-week micro-savings challenges, weekly streaks, and smart target progress.',
    weeklyStreak: 'Week Streak',
    weeklyTarget: 'Weekly Target',
    goalProgress: 'Goal Progress',

    // Stress Test Lab
    stressLabTitle: 'Performance & High-Concurrency Stress Lab',
    stressLabSubtitle: 'Trigger real-time multi-threaded load tests against the settlement engine to verify thread safety.',
    runRaceTest: 'Run Race Stress Test',
    runPriorityTest: 'Run Priority Test',
    runLockIntercept: 'Run Lock Intercept',

    // Auth Page
    signIn: 'Sign In',
    createAccount: 'Create Account',
    customerId: 'Customer ID',
    securityPin: 'Security PIN',
    secureSignIn: 'Secure Sign In',
    fullLegalName: 'Full Legal Name',
    openBankAccount: 'Open Bank Account',
    instantDemoAccess: 'Instant Demo Access',

    // Common
    cancel: 'Cancel',
    confirm: 'Confirm',
    processing: 'Processing...',
  },

  hi: {
    // Brand & Status
    brandSubtitle: 'स्मार्ट बैंकिंग और रीयल-टाइम धोखाधड़ी सुरक्षा',
    liveNetwork: 'लाइव नेटवर्क',
    disconnected: 'डिस्कनेक्टेड',
    engineClock: 'इंजन क्लॉक',
    tick: 'टिक',
    syncData: 'सिंक डेटा',
    signOut: 'साइन आउट',
    activeVerified: 'सक्रिय एवं सत्यापित',
    connectedAccounts: 'जुड़े हुए खाते',

    // Navigation Tabs
    navOverview: 'अवलोकन',
    navTransfers: 'पैसे भेजें',
    navVault: 'सुरक्षा वॉल्ट',
    navLedger: 'लेखा बही',
    navSpending: 'खर्च विश्लेषण',
    navGoals: 'बचत लक्ष्य',
    navStressLab: 'तनाव परीक्षण लैब',

    // Dashboard Overview
    welcomeBack: 'वापसी पर स्वागत है',
    depositFunds: 'धन जमा करें',
    sendMoney: 'पैसे भेजें',
    openAccount: 'खाता खोलें',
    totalLiquidBalance: 'कुल उपलब्ध राशि',
    acrossAllAccounts: 'सभी जुड़े खातों में',
    safetyVaultLocked: 'सुरक्षा वॉल्ट में सुरक्षित',
    autoSavingsRoundups: 'स्वतः बचत एवं राउंडअप',
    pendingReview: 'समीक्षा में लंबित',
    transactionsInCooldown: 'कूलडाउन वॉल्ट में लेनदेन',
    fraudShieldStatus: 'धोखाधड़ी सुरक्षा स्थिति',
    allSecured: 'सुरक्षित',
    locked: 'लॉक किया गया',
    automatedHeuristics: 'स्वचालित सुरक्षा सक्रिय',
    yourAccountsCards: 'आपके खाते एवं कार्ड',
    availableBalance: 'उपलब्ध शेष राशि',
    vaultSavings: 'वॉल्ट बचत',
    annualYield: 'वार्षिक ब्याज',
    overdraftFacility: 'ओवरड्राफ्ट सुविधा',
    totalCreditLimit: 'कुल क्रेडिट सीमा',
    auditLedger: 'लेखा बही देखें',
    transfer: 'ट्रांसफर',
    unlockAccount: 'अनलॉक करें',
    lockAccount: 'लॉक करें',

    // Transfers
    transfersTitle: 'ट्रांसफर और तत्काल भुगतान',
    transfersSubtitle: 'स्वचालित धोखाधड़ी जोखिम मूल्यांकन द्वारा सुरक्षित तत्काल भुगतान।',
    debitAccount: 'डेबिट खाता',
    creditAccount: 'क्रेडिट खाता',
    beneficiaryAccount: 'प्राप्तकर्ता खाता',
    amount: 'राशि',
    categoryNote: 'भुगतान श्रेणी एवं विवरण',
    highValueAlert: 'धोखाधड़ी सुरक्षा सूचना: उच्च मूल्य लेनदेन (≥ ₹25,000) समीक्षा हेतु कूलडाउन वॉल्ट में रखे जाते हैं।',
    authorize: 'अधिकृत करें',
    clearingTransaction: 'लेनदेन संसाधित हो रहा है...',
    settledSuccess: 'लेनदेन सफलतापूर्वक पूर्ण हुआ',
    placedInHold: 'सुरक्षा रोक (कूलडाउन) में रखा गया',
    blockedByFraud: 'धोखाधड़ी सुरक्षा द्वारा अवरोधित',

    // Safety Vault
    vaultTitle: 'सुरक्षा वॉल्ट एवं होल्ड कतार',
    vaultSubtitle: 'संदेहास्पद या बड़े लेनदेन यहां रोके जाते हैं ताकि आप अनधिकृत भुगतान रद्द कर सकें।',
    cancelAndRecall: 'रद्द करें और वापस लें',
    holdQueueClear: 'होल्ड कतार पूरी तरह खाली है',
    ticksRemaining: 'टिक शेष',

    // Statements
    ledgerTitle: 'लेखा बही एवं विवरण',
    ledgerSubtitle: 'जोखिम स्कोर और सत्यापित स्थिति के साथ पूर्ण लेनदेन विवरण।',
    searchPlaceholder: 'श्रेणी, प्राप्तकर्ता, विवरण खोजें...',
    sortByDate: 'तारीख अनुसार',
    sortByAmount: 'राशि अनुसार',
    sortByRisk: 'जोखिम अनुसार',

    // Spending Intel
    spendingTitle: 'व्यय विश्लेषण एवं वित्तीय व्यक्तित्व',
    spendingSubtitle: 'स्वचालित व्यय वर्गीकरण और मासिक बजट निगरानी।',
    financialPersona: 'वित्तीय व्यक्तित्व',
    totalExpenditure: 'कुल खर्च (डेबिट)',
    autoSavedInVault: 'वॉल्ट में स्वतः संचित',
    monthlyCategoryBudgets: 'मासिक श्रेणी बजट बनाम व्यय',

    // Savings Goals
    savingsGoalsTitle: 'बचत लक्ष्य एवं उपलब्धियां',
    savingsGoalsSubtitle: 'स्वचालित 8-सप्ताह बचत चुनौतियां, साप्ताहिक स्ट्रीक और प्रगति।',
    weeklyStreak: 'साप्ताहिक स्ट्रीक',
    weeklyTarget: 'साप्ताहिक लक्ष्य',
    goalProgress: 'लक्ष्य प्रगति',

    // Stress Test Lab
    stressLabTitle: 'प्रदर्शन एवं उच्च-समवर्ती तनाव लैब',
    stressLabSubtitle: 'थ्रेड सुरक्षा और प्राथमिकता परीक्षण के लिए वास्तविक समय में बहु-थ्रेडेड लोड टेस्ट चलाएं।',
    runRaceTest: 'रेस तनाव परीक्षण चलाएं',
    runPriorityTest: 'प्राथमिकता परीक्षण चलाएं',
    runLockIntercept: 'लॉक इंटरसेप्ट चलाएं',

    // Auth Page
    signIn: 'साइन इन करें',
    createAccount: 'खाता बनाएं',
    customerId: 'ग्राहक आईडी',
    securityPin: 'सुरक्षा पिन',
    secureSignIn: 'सुरक्षित साइन इन',
    fullLegalName: 'पूरा कानूनी नाम',
    openBankAccount: 'बैंक खाता खोलें',
    instantDemoAccess: 'त्वरित डेमो पहुंच',

    // Common
    cancel: 'रद्द करें',
    confirm: 'पुष्टि करें',
    processing: 'प्रक्रिया जारी है...',
  },

  es: {
    brandSubtitle: 'Banca Inteligente y Protección Antifraude',
    liveNetwork: 'Red en Vivo',
    disconnected: 'Desconectado',
    engineClock: 'Reloj del Sistema',
    tick: 'Ciclo',
    syncData: 'Sincronizar',
    signOut: 'Cerrar Sesión',
    activeVerified: 'Activo y Verificado',
    connectedAccounts: 'Cuentas Conectadas',
    navOverview: 'Resumen',
    navTransfers: 'Transferir y Pagar',
    navVault: 'Bóveda Segura',
    navLedger: 'Libro Mayor',
    navSpending: 'Análisis de Gastos',
    navGoals: 'Metas de Ahorro',
    navStressLab: 'Pruebas de Estrés',
    welcomeBack: 'Bienvenido de nuevo',
    depositFunds: 'Depositar Fondos',
    sendMoney: 'Enviar Dinero',
    openAccount: 'Abrir Cuenta',
    totalLiquidBalance: 'Saldo Líquido Total',
    acrossAllAccounts: 'En todas las cuentas conectadas',
    safetyVaultLocked: 'Bóveda de Seguridad Bloqueada',
    autoSavingsRoundups: 'Ahorro automático y redondeos',
    pendingReview: 'Pendiente de Revisión',
    transactionsInCooldown: 'Transacciones en Espera',
    fraudShieldStatus: 'Estado de Protección',
    allSecured: 'Asegurado',
    locked: 'Bloqueado',
    automatedHeuristics: 'Heurísticas activas',
    yourAccountsCards: 'Tus Cuentas y Tarjetas',
    availableBalance: 'Saldo Disponible',
    vaultSavings: 'Ahorros en Bóveda',
    annualYield: 'Rendimiento Anual',
    overdraftFacility: 'Límite de Sobregiro',
    totalCreditLimit: 'Límite de Crédito Total',
    auditLedger: 'Ver Libro Mayor',
    transfer: 'Transferir',
    unlockAccount: 'Desbloquear',
    lockAccount: 'Bloquear',
    transfersTitle: 'Transferencias y Pagos Instantáneos',
    transfersSubtitle: 'Compensación multicanal instantánea protegida por evaluación de riesgo de fraude.',
    debitAccount: 'Cuenta de Débito',
    creditAccount: 'Cuenta de Crédito',
    beneficiaryAccount: 'Cuenta Beneficiaria',
    amount: 'Monto',
    categoryNote: 'Categoría y Descripción',
    highValueAlert: 'Aviso de Seguridad: Transferencias de alto valor (≥ ₹25,000) se retienen para revisión.',
    authorize: 'Autorizar',
    clearingTransaction: 'Procesando Transacción...',
    settledSuccess: 'Transacción Liquidada Exitosamente',
    placedInHold: 'Puesta en Retención de Seguridad',
    blockedByFraud: 'Transacción Bloqueada por Antifraude',
    vaultTitle: 'Bóveda de Seguridad y Cola de Espera',
    vaultSubtitle: 'Las transferencias de alto riesgo se pausarán aquí para permitirle cancelar débitos no autorizados.',
    cancelAndRecall: 'Cancelar y Recuperar',
    holdQueueClear: 'La cola de espera está despejada',
    ticksRemaining: 'ciclos restantes',
    ledgerTitle: 'Libro Mayor y Estados de Cuenta',
    ledgerSubtitle: 'Historial completo con puntuaciones de riesgo y estado verificado.',
    searchPlaceholder: 'Buscar categoría, destinatario...',
    sortByDate: 'Ordenar por Fecha',
    sortByAmount: 'Ordenar por Monto',
    sortByRisk: 'Ordenar por Riesgo',
    spendingTitle: 'Análisis de Gastos y Perfil',
    spendingSubtitle: 'Clasificación automatizada de gastos y control presupuestario.',
    financialPersona: 'Perfil Financiero',
    totalExpenditure: 'Gasto Total (Débitos)',
    autoSavedInVault: 'Autoahorrado en Bóveda',
    monthlyCategoryBudgets: 'Presupuestos Mensuales vs Gasto',
    savingsGoalsTitle: 'Metas de Ahorro y Logros',
    savingsGoalsSubtitle: 'Desafíos de microahorro de 8 semanas y rachas semanales.',
    weeklyStreak: 'Racha Semanal',
    weeklyTarget: 'Meta Semanal',
    goalProgress: 'Progreso de Meta',
    stressLabTitle: 'Laboratorio de Estrés y Alta Concurrencia',
    stressLabSubtitle: 'Ejecute pruebas de carga multihilo en tiempo real contra el motor de liquidación.',
    runRaceTest: 'Ejecutar Prueba de Concurrencia',
    runPriorityTest: 'Ejecutar Prueba de Prioridad',
    runLockIntercept: 'Ejecutar Intercepción',
    signIn: 'Iniciar Sesión',
    createAccount: 'Crear Cuenta',
    customerId: 'ID de Cliente',
    securityPin: 'PIN de Seguridad',
    secureSignIn: 'Acceso Seguro',
    fullLegalName: 'Nombre Legal Completo',
    openBankAccount: 'Abrir Cuenta Bancaria',
    instantDemoAccess: 'Acceso Rápido de Demostración',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    processing: 'Procesando...',
  },

  fr: {
    brandSubtitle: 'Banque Intelligente & Protection Fraude',
    liveNetwork: 'Réseau Actif',
    disconnected: 'Déconnecté',
    engineClock: 'Horloge Système',
    tick: 'Cycle',
    syncData: 'Synchroniser',
    signOut: 'Déconnexion',
    activeVerified: 'Actif & Vérifié',
    connectedAccounts: 'Comptes Connectés',
    navOverview: 'Aperçu',
    navTransfers: 'Virements',
    navVault: 'Coffre-Fort',
    navLedger: 'Grand Livre',
    navSpending: 'Analytique Dépenses',
    navGoals: 'Objectifs d’Épargne',
    navStressLab: 'Banc d’Essai',
    welcomeBack: 'Bon retour',
    depositFunds: 'Déposer des Fonds',
    sendMoney: 'Envoyer de l’Argent',
    openAccount: 'Ouvrir un Compte',
    totalLiquidBalance: 'Solde Liquide Total',
    acrossAllAccounts: 'Sur tous les comptes associés',
    safetyVaultLocked: 'Coffre-Fort Sécurisé',
    autoSavingsRoundups: 'Micro-épargne automatique',
    pendingReview: 'En Attente de Vérification',
    transactionsInCooldown: 'Transactions en Attente',
    fraudShieldStatus: 'Statut du Bouclier',
    allSecured: 'Sécurisé',
    locked: 'Verrouillé',
    automatedHeuristics: 'Analyses heuristiques actives',
    yourAccountsCards: 'Vos Comptes et Cartes',
    availableBalance: 'Solde Disponible',
    vaultSavings: 'Épargne Coffre',
    annualYield: 'Rendement Annuel',
    overdraftFacility: 'Facilité de Découvert',
    totalCreditLimit: 'Limite de Crédit Totale',
    auditLedger: 'Consulter le Grand Livre',
    transfer: 'Transférer',
    unlockAccount: 'Déverrouiller',
    lockAccount: 'Verrouiller',
    transfersTitle: 'Virements et Paiements Instantanés',
    transfersSubtitle: 'Règlement multicanal instantané protégé par évaluation automatisée des fraudes.',
    debitAccount: 'Compte Débiteur',
    creditAccount: 'Compte Créditeur',
    beneficiaryAccount: 'Compte Bénéficiaire',
    amount: 'Montant',
    categoryNote: 'Catégorie & Motif',
    highValueAlert: 'Alerte Fraude: Les transferts importants (≥ ₹25,000) sont temporisés pour vérification.',
    authorize: 'Autoriser',
    clearingTransaction: 'Règlement en cours...',
    settledSuccess: 'Transaction Réglée avec Succès',
    placedInHold: 'Placée en Rétention de Sécurité',
    blockedByFraud: 'Transaction Bloquée par l’Antifraude',
    vaultTitle: 'Coffre de Sécurité & File d’Attente',
    vaultSubtitle: 'Les transactions sensibles sont suspendues pour vous permettre d’annuler tout débit suspect.',
    cancelAndRecall: 'Annuler et Rappeler',
    holdQueueClear: 'Aucune transaction retenue',
    ticksRemaining: 'cycles restants',
    ledgerTitle: 'Grand Livre & Relevés',
    ledgerSubtitle: 'Relevés complets avec scores de risque et état certifié.',
    searchPlaceholder: 'Rechercher catégorie, bénéficiaire...',
    sortByDate: 'Trier par Date',
    sortByAmount: 'Trier par Montant',
    sortByRisk: 'Trier par Risque',
    spendingTitle: 'Analyse des Dépenses & Profil',
    spendingSubtitle: 'Classification automatisée et suivi des budgets mensuels.',
    financialPersona: 'Profil Financier',
    totalExpenditure: 'Dépenses Totales',
    autoSavedInVault: 'Auto-épargné dans le Coffre',
    monthlyCategoryBudgets: 'Budgets Mensuels vs Dépenses',
    savingsGoalsTitle: 'Objectifs d’Épargne & Défis',
    savingsGoalsSubtitle: 'Défis d’épargne sur 8 semaines et suivi de régularité.',
    weeklyStreak: 'Série Hebdomadaire',
    weeklyTarget: 'Cible Hebdomadaire',
    goalProgress: 'Progression de l’Objectif',
    stressLabTitle: 'Laboratoire de Test de Charge Multi-Thread',
    stressLabSubtitle: 'Exécutez des tests de charge en temps réel sur le moteur de règlement.',
    runRaceTest: 'Lancer Test Concurrence',
    runPriorityTest: 'Lancer Test Priorité',
    runLockIntercept: 'Lancer Test Blocage',
    signIn: 'Connexion',
    createAccount: 'Créer un Compte',
    customerId: 'Identifiant Client',
    securityPin: 'Code PIN',
    secureSignIn: 'Connexion Sécurisée',
    fullLegalName: 'Nom et Prénom',
    openBankAccount: 'Ouvrir un Compte Bancaire',
    instantDemoAccess: 'Accès Démo Instantané',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    processing: 'Traitement en cours...',
  },

  de: {
    brandSubtitle: 'Smart Banking & Echtzeit-Betrugsschutz',
    liveNetwork: 'Live-Netzwerk',
    disconnected: 'Getrennt',
    engineClock: 'Systemtakt',
    tick: 'Takt',
    syncData: 'Synchronisieren',
    signOut: 'Abmelden',
    activeVerified: 'Aktiv & Verifiziert',
    connectedAccounts: 'Verbundene Konten',
    navOverview: 'Übersicht',
    navTransfers: 'Überweisen',
    navVault: 'Sicherheitstresor',
    navLedger: 'Hauptbuch',
    navSpending: 'Ausgabenanalyse',
    navGoals: 'Sparziele',
    navStressLab: 'Stresstest-Labor',
    welcomeBack: 'Willkommen zurück',
    depositFunds: 'Einzahlen',
    sendMoney: 'Geld senden',
    openAccount: 'Konto eröffnen',
    totalLiquidBalance: 'Gesamtsaldo',
    acrossAllAccounts: 'Über alle verbundenen Konten',
    safetyVaultLocked: 'Im Tresor gesichert',
    autoSavingsRoundups: 'Automatisches Aufrunden',
    pendingReview: 'In Prüfung',
    transactionsInCooldown: 'Transaktionen in Warteschlange',
    fraudShieldStatus: 'Sicherheitsstatus',
    allSecured: 'Gesichert',
    locked: 'Gesperrt',
    automatedHeuristics: 'Sicherheitsheuristik aktiv',
    yourAccountsCards: 'Ihre Konten & Karten',
    availableBalance: 'Verfügbares Guthaben',
    vaultSavings: 'Tresor-Guthaben',
    annualYield: 'Jahreszins',
    overdraftFacility: 'Dispokreditrahmen',
    totalCreditLimit: 'Gesamter Kreditrahmen',
    auditLedger: 'Hauptbuch ansehen',
    transfer: 'Überweisung',
    unlockAccount: 'Entsperren',
    lockAccount: 'Sperren',
    transfersTitle: 'Überweisungen & Sofortzahlungen',
    transfersSubtitle: 'Sofortige Abwicklung geschützt durch automatische Risikobewertung.',
    debitAccount: 'Belastungskonto',
    creditAccount: 'Gutschriftskonto',
    beneficiaryAccount: 'Empfängerkonto',
    amount: 'Betrag',
    categoryNote: 'Kategorie & Verwendungszweck',
    highValueAlert: 'Sicherheitshinweis: Größere Überweisungen (≥ ₹25.000) werden zur Prüfung zwischengespeichert.',
    authorize: 'Autorisieren',
    clearingTransaction: 'Transaktion wird verarbeitet...',
    settledSuccess: 'Transaktion erfolgreich abgewickelt',
    placedInHold: 'In Sicherheitswarteschlange verschoben',
    blockedByFraud: 'Durch Betrugsschutz blockiert',
    vaultTitle: 'Sicherheitstresor & Halteschlange',
    vaultSubtitle: 'Risikobehaftete Überweisungen werden pausiert, damit unautorisierte Buchungen storniert werden können.',
    cancelAndRecall: 'Stornieren & Zurückrufen',
    holdQueueClear: 'Warteschlange ist leer',
    ticksRemaining: 'Takte verbleibend',
    ledgerTitle: 'Hauptbuch & Kontoauszüge',
    ledgerSubtitle: 'Vollständige Auszüge mit Risikobewertungen und Status.',
    searchPlaceholder: 'Kategorie, Empfänger suchen...',
    sortByDate: 'Nach Datum sortieren',
    sortByAmount: 'Nach Betrag sortieren',
    sortByRisk: 'Nach Risiko sortieren',
    spendingTitle: 'Ausgabenanalyse & Finanzprofil',
    spendingSubtitle: 'Automatische Klassifizierung und Budgetüberwachung.',
    financialPersona: 'Finanzprofil',
    totalExpenditure: 'Gesamtausgaben',
    autoSavedInVault: 'Im Tresor angespart',
    monthlyCategoryBudgets: 'Monatliche Budgets vs Ausgaben',
    savingsGoalsTitle: 'Sparziele & Meilensteine',
    savingsGoalsSubtitle: 'Automatische 8-Wochen-Sparherausforderungen und wöchentliche Serien.',
    weeklyStreak: 'Wochenserie',
    weeklyTarget: 'Wochenziel',
    goalProgress: 'Ziel-Fortschritt',
    stressLabTitle: 'Hochlast- & Multithreading-Labor',
    stressLabSubtitle: 'Führen Sie Multithread-Lasttests gegen das Abwicklungssystem in Echtzeit durch.',
    runRaceTest: 'Rennbedingungs-Test',
    runPriorityTest: 'Prioritäts-Test',
    runLockIntercept: 'Sperr-Test',
    signIn: 'Anmelden',
    createAccount: 'Konto erstellen',
    customerId: 'Kunden-ID',
    securityPin: 'Sicherheits-PIN',
    secureSignIn: 'Sicher anmelden',
    fullLegalName: 'Vollständiger Name',
    openBankAccount: 'Bankkonto eröffnen',
    instantDemoAccess: 'Schneller Demo-Zugang',
    cancel: 'Abbrechen',
    confirm: 'Bestätigen',
    processing: 'Wird verarbeitet...',
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('finguard_lang') || 'en';
  });

  const [dynamicCache, setDynamicCache] = useState(() => {
    try {
      const saved = localStorage.getItem('finguard_trans_cache');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [isTranslating, setIsTranslating] = useState(false);

  // Set language and persist
  const setLanguage = (langCode) => {
    setLanguageState(langCode);
    localStorage.setItem('finguard_lang', langCode);
  };

  // Translation Function (Dictionary + Dynamic Fallback)
  const t = useCallback((key, defaultFallback = '') => {
    const dict = BASE_DICTIONARIES[language] || BASE_DICTIONARIES.en;
    if (dict && dict[key]) {
      return dict[key];
    }
    // Check dynamic API cache for this language
    const cacheKey = `${language}:${key}`;
    if (dynamicCache[cacheKey]) {
      return dynamicCache[cacheKey];
    }
    return defaultFallback || BASE_DICTIONARIES.en[key] || key;
  }, [language, dynamicCache]);

  // Dynamic Translation API Call (using open MyMemory API)
  const translateViaApi = useCallback(async (text, targetLang = language, sourceLang = 'en') => {
    if (!text || targetLang === sourceLang) return text;
    
    const cacheKey = `${targetLang}:${text}`;
    if (dynamicCache[cacheKey]) {
      return dynamicCache[cacheKey];
    }

    setIsTranslating(true);
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data?.responseData?.translatedText) {
        const translated = data.responseData.translatedText;
        setDynamicCache(prev => {
          const updated = { ...prev, [cacheKey]: translated };
          try {
            localStorage.setItem('finguard_trans_cache', JSON.stringify(updated));
          } catch (e) {
            console.warn('Storage limit for translation cache', e);
          }
          return updated;
        });
        return translated;
      }
    } catch (err) {
      console.warn('Translation API network error:', err);
    } finally {
      setIsTranslating(false);
    }

    return text;
  }, [language, dynamicCache]);

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      t,
      translateViaApi,
      isTranslating,
      supportedLanguages: SUPPORTED_LANGUAGES,
      currentLanguageObj: SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0],
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
