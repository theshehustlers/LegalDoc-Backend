% rules.pl
:- use_module(library(lists)).

% --- helpers ---
has_any(KWs, Options) :-
  intersection(KWs, Options, I),
  I \= [].

has_n_of(KWs, Options, N) :-
  intersection(KWs, Options, I),
  length(I, L),
  L >= N.
% --------- Specific / High-Confidence ---------

% New Research/Brief rule (catches methodology docs like your sample)
categorize(K, 'Research/Brief', 0.85,
  'Contains research methodology/analysis/reporting terminology.') :-
    has_any(K, [research, methodology, analysis, findings, questionnaire, survey, interview, observation, literature, data, sampling, hypothesis, results, discussion]).


% Resume/CV must NOT look like a contract
categorize(K, 'Resume/CV', 0.92,
  'Contains CV/resume signals without contract cues.') :-
    (
      has_any(K, [resume, curriculum_vitae])
      ;
      has_n_of(K, [education, experience, skills, qualifications], 2)
    ),
    \+ has_any(K, [contract, agreement, party, parties, clause, termination]).

categorize(K, 'Estate Planning/Will', 0.95, 'Wills & probate terms such as will, bequeath, estate, executor, or probate.') :-
    has_keyword(K, [last_will_and_testament, will, testament, probate, codicil, bequeath, estate, executor, executrix, beneficiary]).

% Stronger Contract rule comes BEFORE resume to take precedence
categorize(K, 'Contract/Agreement', 0.88,
  'Contains agreement/contract language with parties/clauses/termination.') :-
has_any(K, [contract, agreement]),
    has_any(K, [party, parties, clause, termination, consideration, covenant]).

categorize(K, 'Property/Real Estate', 0.85, 'Property & tenancy terms such as lease, landlord, tenant, deed, or premises.') :-
    has_keyword(K, [property, real_estate, lease, tenancy, landlord, tenant, deed, conveyance, premises, survey_plan, certificate_of_occupancy, c_of_o, right_of_occupancy]).

categorize(K, 'Employment Law', 0.80, 'Employment/HR terms like employee, employer, salary, or dismissal.') :-
    has_keyword(K, [employment, employee, employer, salary, remuneration, position, role, dismissal, termination, redundancy, probation, non_compete, severance]).

categorize(K, 'Intellectual Property', 0.80, 'IP terms such as patent, trademark, copyright, or infringement.') :-
    has_keyword(K, [intellectual_property, ip, patent, trademark, trade_mark, copyright, license, licensing, infringement, prior_art, registration, trade_secret]).

categorize(K, 'Litigation/Court', 0.75, 'Civil procedure & court filings like plaintiff, affidavit, motion, or judgment.') :-
    has_keyword(K, [litigation, lawsuit, suit, court, plaintiff, claimant, defendant, complaint, statement_of_claim, defence, motion, affidavit, order, judgment, decree, appeal, writ, injunction]).

categorize(K, 'Family Law', 0.75, 'Family/matrimonial terms like divorce, custody, or maintenance.') :-
    has_keyword(K, [family_law, divorce, dissolution, custody, maintenance, alimony, child_support, adoption, paternity, guardianship, marriage, separation, prenuptial, matrimonial]).

categorize(K, 'Criminal Law', 0.90, 'Criminal proceedings like charge, offense/offence, prosecution, or sentence.') :-
    has_keyword(K, [criminal, crime, charge, offense, offence, prosecution, defendant, sentence, arraignment, conviction, bail]).

categorize(K, 'Tax Law', 0.75, 'Taxation & revenue terms such as tax, vat, paye, or assessment.') :-
    has_keyword(K, [tax, taxation, revenue, vat, paye, withholding_tax, stamp_duty, capital_gains_tax, assessment, audit, return, compliance, exemption]).

categorize(K, 'Insurance', 0.70, 'Insurance policy & claims terms like policy, premium, indemnity, or coverage.') :-
    has_keyword(K, [insurance, insurer, insured, policy, premium, claim, claims, indemnity, coverage, risk, reinsurance, subrogation, exclusion, beneficiary, broker]).

categorize(K, 'Banking/Finance', 0.60, 'Financial/banking terms such as loan, mortgage, collateral, or repayment.') :-
    has_keyword(K, [bank, banking, finance, financial, loan, credit, facility, mortgage, charge_over_assets, security, collateral, guarantee, repayment, interest, account, remittance, payment]).

categorize(K, 'Corporate/Business', 0.60, 'Corporate governance/business terms like company, shares, board, or resolution.') :-
    has_keyword(K, [corporate, business, company, shares, shareholding, bylaws, articles_of_association, memorandum, resolution, board, director, shareholder, minutes, incorporation, company_secretary]).

categorize(K, 'Research/Brief', 0.80, 'Legal research or briefing structure (IRAC, memo, authorities).') :-
    has_keyword(K, [research, memo, memorandum, brief, legal_brief, argument, authorities, case_law, precedent, statute, analysis, summary, issue, facts, conclusion, irac]).

% --------- Final Fallback ---------

categorize(_, 'General Legal Document', 0.30, 'No specific keywords matched, classified as general.').