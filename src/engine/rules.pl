% rules.pl
:- use_module(library(lists)).

% Helper: true if any option appears in Keywords
has_keyword(Keywords, Options) :-
    intersection(Keywords, Options, Intersection),
    Intersection \= [].

% --------- Specific / High-Confidence ---------

categorize(K, 'Resume/CV', 0.95, 'Contains resume/CV terms such as resume, education, skills, or experience.') :-
    has_keyword(K, [resume, curriculum_vitae, cv, education, experience, skills, qualifications, work_history, profile, summary]).

categorize(K, 'Estate Planning/Will', 0.95, 'Wills & probate terms such as will, bequeath, estate, executor, or probate.') :-
    has_keyword(K, [last_will_and_testament, will, testament, probate, codicil, bequeath, estate, executor, executrix, beneficiary]).

categorize(K, 'Contract/Agreement', 0.85, 'Standard contractual language like agreement, clause, termination, or NDA.') :-
    has_keyword(K, [contract, agreement, party, parties, clause, terms, termination, force_majeure, indemnity, consideration, warranty, confidentiality, nda, non_disclosure_agreement]).

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