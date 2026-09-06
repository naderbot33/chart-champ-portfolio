# Retired automation test fixtures

These historical definitions exercise validation, mocked delivery, and export
behavior only. They are not production schedules and must not be copied into
`automation/` or installed as scheduled jobs. The production jobs and schedules
remain retired. Prompt paths reference the retained historical prompt files.

Tests inject this directory explicitly; production configuration never discovers
or falls back to these fixtures. Live delivery tests inject fake Keychain and
network functions. No credentials are stored here.
