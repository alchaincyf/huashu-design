"""环境识别：一个 agent 里启动另一个时不能认错人。

Stdlib-only: python3 -m unittest discover -s scripts/tests -p test_capabilities.py -v
"""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import capabilities as cap  # noqa: E402


def chain(*procs):
    """procs 从近到远：[(comm, args), …]。返回一个假的 ps。"""
    table = {}
    import os
    pid = os.getppid()
    for k, (comm, args) in enumerate(procs):
        nxt = 1 if k == len(procs) - 1 else 90000 + k
        table[pid] = (str(nxt), comm, args)
        pid = nxt
    return lambda p: table.get(p, ('1', '', ''))


def no_ps(_pid):
    raise OSError('ps blocked')


class Runtime(unittest.TestCase):
    def test_paths_passing_through_do_not_count(self):
        self.assertIsNone(cap.classify('/bin/zsh', '/bin/zsh -c source /home/u/.claude/shell-snapshots/x.sh'))
        self.assertIsNone(cap.classify('/home/u/.codex/plugins/cache/chrome/ChatGPT for Chrome'))

    def test_classify_names(self):
        self.assertEqual(cap.classify('/usr/local/bin/codex'), 'codex')
        self.assertEqual(cap.classify('claude'), 'claude')
        self.assertEqual(cap.classify('node', 'node /opt/cli/dist/codebuddy-lite-wb.mjs --print'), 'buddy')
        self.assertEqual(cap.classify('/Applications/WorkBuddy.app/Contents/MacOS/WorkBuddy'), 'buddy')

    def test_doubao_and_dsh_are_recognised_by_process(self):
        self.assertEqual(cap.classify('/Applications/DoubaoWork.app/Contents/MacOS/DoubaoWork'), 'doubao')
        self.assertEqual(cap.classify('node', 'node /home/u/.npm/_npx/ab/node_modules/@deepseek-ai/dsh/dist/cli.js web'), 'dsh')
        self.assertTrue(cap.RUNTIMES['doubao'][1])
        self.assertFalse(cap.RUNTIMES['dsh'][1])

    def test_route_asks_user_for_key_only_when_nothing_else(self):
        self.assertTrue(any('请用户提供' in r for r in cap.image_route(False, False, [])))
        self.assertFalse(any('请用户提供' in r for r in cap.image_route(False, True, [])))
        self.assertTrue(any('--via api' in r for r in cap.image_route(False, False, [], '火山方舟 Seedream')))

    def test_nearest_ancestor_wins(self):
        ps = chain(('/bin/zsh', 'zsh -c x'), ('/usr/local/bin/codex', 'codex exec -'), ('/bin/zsh', 'zsh'), ('claude', 'claude'))
        name, native, basis = cap.runtime_hint(ps=ps, env={'CLAUDECODE': '1', 'CODEX_THREAD_ID': 't'})
        self.assertEqual((name, native, basis), ('Codex', True, '父进程'))

    def test_codex_sandbox_with_inherited_claude_env(self):
        # 实测（2026-11）：Claude Code 里启动的 Codex 继承了 CLAUDECODE，沙箱里 ps 也跑不了
        name, native, _ = cap.runtime_hint(ps=no_ps, env={'CLAUDECODE': '1', 'CODEX_SANDBOX': 'seatbelt', 'CODEX_THREAD_ID': 't'})
        self.assertEqual((name, native), ('Codex', True))

    def test_env_fallbacks(self):
        self.assertEqual(cap.runtime_hint(ps=no_ps, env={'CODEBUDDY': '1'})[:2], ('WorkBuddy / CodeBuddy', True))
        self.assertEqual(cap.runtime_hint(ps=no_ps, env={'CLAUDECODE': '1'})[:2], ('Claude Code', False))
        self.assertEqual(cap.runtime_hint(ps=no_ps, env={'CODEX_HOME': '/x'}), (None, None, None))

    def test_ambiguous_env_is_reported_not_guessed(self):
        name, native, _ = cap.runtime_hint(ps=no_ps, env={'CLAUDECODE': '1', 'CODEX_THREAD_ID': 't'})
        self.assertIsNone(native)
        self.assertIn('分不出', name)


if __name__ == '__main__':
    unittest.main()
