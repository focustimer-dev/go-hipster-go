"""Constrained challenger test on synthetic fixtures, NOT actual playlist quality."""
import importlib.util
import json
import unittest
from dataclasses import replace
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ENGINE = ROOT / "research" / "method-challenger" / "shadow.py"
spec = importlib.util.spec_from_file_location("method_challenger", ENGINE)
engine = importlib.util.module_from_spec(spec)
import sys
sys.modules[spec.name] = engine
spec.loader.exec_module(engine)


class MethodChallengerTests(unittest.TestCase):
    def test_three_prompts_four_arms_and_repeated_seeds(self):
        for prompt in engine.PROMPTS:
            pool = engine.catalog(prompt)
            self.assertEqual(len(pool), 96)
            self.assertEqual(len({x.artist for x in pool}), 96)
            for seed in (1, 2, 3, 4, 5):
                out = engine.treatments(pool, seed)
                self.assertEqual(set(out), set(engine.ARMS))
                for name, seq in out.items():
                    with self.subTest(prompt=prompt, seed=seed, arm=name):
                        self.assertEqual(len(seq), 12)
                        self.assertEqual(len({x.id for x in seq}), 12)
                        self.assertEqual(len({x.artist for x in seq}), 12)
                        self.assertTrue(all(x.mood_fit >= 0.70 for x in seq))

    def test_challenger_never_claims_benefit_by_worsening_its_own_metric(self):
        for prompt in engine.PROMPTS:
            pool = engine.catalog(prompt)
            for seed in (1, 2, 3, 4, 5):
                out = engine.treatments(pool, seed)
                a, b, c, d = (out[x] for x in engine.ARMS)
                sa, sb, sc, sd = map(engine.stats, (a, b, c, d))
                with self.subTest(prompt=prompt, seed=seed):
                    self.assertGreaterEqual(sb["scenes"], sa["scenes"])
                    self.assertGreaterEqual(sb["fit"] + 1e-9, sa["fit"] - 0.050001)
                    self.assertGreaterEqual(sc["transition"] + 1e-9, sa["transition"])
                    self.assertGreaterEqual(sd["transition"] + 1e-9, sb["transition"])
                    self.assertEqual({x.id for x in a}, {x.id for x in c})
                    self.assertEqual({x.id for x in b}, {x.id for x in d})
                    self.assertEqual(sb["scenes"], sd["scenes"])

    def test_open_corpus_identity_invariant(self):
        pool = engine.catalog("go sad")
        relabeled = tuple(replace(x, artist="unrelated-"+x.artist) for x in pool)
        original = engine.treatments(pool, 2)
        altered = engine.treatments(relabeled, 2)
        for arm in engine.ARMS:
            self.assertEqual([x.id for x in original[arm]],
                             [x.id for x in altered[arm]])
        self.assertNotIn("NWW", ENGINE.read_text(encoding="utf-8"))

    def test_rejects_false_novelty_and_can_abstain(self):
        src = engine.catalog("go angry")
        original = engine.baseline(src, 3)
        bad = replace(src[0], id="novel-but-incompatible",
                      artist="unrelated", scene="unheard-scene",
                      mood_fit=0.01, novelty=1.0)
        after = engine.diversify(original, src + (bad,))
        self.assertNotIn(bad.id, [x.id for x in after])
        self.assertEqual(original, engine.diversify(original, original))
        # Flat-method/no-difference fixture: ordering needn't change.
        flat = tuple(replace(x, operation="same", role="same",
                             texture="same", energy=2) for x in original)
        self.assertEqual(engine.resequence(flat), flat)

    def test_run_results_are_deterministic(self):
        once = engine.evaluate(seeds=(1, 2))
        again = engine.evaluate(seeds=(1, 2))
        self.assertEqual(once, again)
        self.assertEqual(set(once["prompt_results"]), set(engine.PROMPTS))
        self.assertIn("Synthetic records", once["limitations"][0])

    def test_research_only_and_report_summary(self):
        prod = (ROOT / "SKILL.md").read_text(encoding="utf-8")
        self.assertNotIn("research/method-challenger", prod)
        summary = engine.evaluate()
        print("SHADOW_CHALLENGER_RESULTS="+json.dumps(summary["prompt_results"], sort_keys=True))


if __name__ == "__main__":
    unittest.main()
