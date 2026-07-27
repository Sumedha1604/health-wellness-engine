import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Dumbbell,
  Loader2,
  Sparkles,
  Timer,
} from "lucide-react";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import {
  completeWorkoutPlan,
  generateWorkoutPlan,
  getWorkoutPlanById,
  getWorkoutPlans,
} from "../services/workoutPlan.service";

function ExerciseCard({ exercise }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 transition-all duration-200 hover:border-purple-100 hover:bg-purple-50/40">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-900">{exercise.title}</h3>
          <p className="mt-1 text-xs text-gray-500">
            {exercise.body_part} · {exercise.equipment}
          </p>
        </div>
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gray-500">
          {exercise.difficulty_level}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-xl bg-white p-2 text-gray-600">
          <strong className="block text-sm text-gray-900">{exercise.sets}</strong>
          Sets
        </div>
        <div className="rounded-xl bg-white p-2 text-gray-600">
          <strong className="block text-sm text-gray-900">{exercise.reps}</strong>
          Reps
        </div>
        <div className="rounded-xl bg-white p-2 text-gray-600">
          <strong className="block text-sm text-gray-900">{exercise.duration_minutes}</strong>
          Minutes
        </div>
      </div>
    </div>
  );
}

export default function WorkoutPlans() {

  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [completing, setCompleting] = useState(false);

  async function loadPlans(selectLatest = true) {
    try {
      const planList = await getWorkoutPlans();
      setPlans(planList);

      if (selectLatest && planList.length > 0) {
        const plan = await getWorkoutPlanById(planList[0].id);
        setSelectedPlan(plan);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Unable to load workout plans.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlans();
  }, []);

  async function handleSelectPlan(id) {
    try {
      const plan = await getWorkoutPlanById(id);
      setSelectedPlan(plan);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load this workout plan.");
    }
  }

  async function handleGenerate() {
    try {
      setGenerating(true);
      const plan = await generateWorkoutPlan();
      setSelectedPlan(plan);
      await loadPlans(false);
      toast.success("Your personalized workout plan is ready!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to generate a workout plan.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleComplete() {
    if (!selectedPlan) return;

    try {
      setCompleting(true);
      await completeWorkoutPlan(selectedPlan.id);
      setSelectedPlan((current) => ({
        ...current,
        completed_at: new Date().toISOString(),
      }));
      setPlans((current) => current.map((plan) => (
        plan.id === selectedPlan.id
          ? { ...plan, completed_at: new Date().toISOString() }
          : plan
      )));
      toast.success("Workout plan marked as complete!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to complete this workout plan.");
    } finally {
      setCompleting(false);
    }
  }

  const weeklyExercises = selectedPlan?.exercises?.reduce(
    (days, exercise) => ({
      ...days,
      [exercise.day_number]: [
        ...(days[exercise.day_number] || []),
        exercise,
      ],
    }),
    {}
  ) || {};

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-6 rounded-3xl bg-gradient-to-r from-purple-500 to-violet-600 p-8 text-white shadow-lg md:flex-row md:items-center">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-purple-100">AI Workout Planner</p>
          <h1 className="mt-2 text-4xl font-bold">Train with a clear plan</h1>
          <p className="mt-3 max-w-2xl text-purple-100">Generate a weekly routine using your goal, activity level, and exercise recommendations.</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-purple-700 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
        >
          {generating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
          {generating ? "Generating..." : "Generate Workout Plan"}
        </button>
      </div>

      {plans.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => handleSelectPlan(plan.id)}
              className={`min-w-52 rounded-2xl border p-4 text-left transition-all ${selectedPlan?.id === plan.id ? "border-purple-200 bg-purple-50" : "border-gray-100 bg-white hover:border-purple-100"}`}
            >
              <p className="font-semibold text-gray-900">{plan.title}</p>
              <p className="mt-1 text-xs text-gray-500">{plan.exercise_count} exercises · {plan.completed_at ? "Completed" : "Active"}</p>
            </button>
          ))}
        </div>
      )}

      {!selectedPlan ? (
        <div className="rounded-3xl bg-white p-14 text-center shadow-card">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-50"><Dumbbell className="h-8 w-8 text-purple-600" /></span>
          <h2 className="mt-5 text-2xl font-semibold text-gray-900">Create your first workout plan</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">We&apos;ll build a weekly routine from your preferences and recommended exercises.</p>
          <div className="mx-auto mt-6 max-w-xs"><Button onClick={handleGenerate} disabled={generating}>{generating ? "Generating..." : "Generate Workout Plan"}</Button></div>
        </div>
      ) : (
        <div className="rounded-3xl bg-white p-8 shadow-card">
          <div className="flex flex-col justify-between gap-5 border-b border-gray-100 pb-6 md:flex-row md:items-start">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-purple-600"><CalendarDays className="h-4 w-4" /> {selectedPlan.duration_weeks} week plan · {selectedPlan.goal}</div>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{selectedPlan.title}</h2>
              {selectedPlan.description && <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">{selectedPlan.description}</p>}
            </div>
            {selectedPlan.completed_at ? (
              <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"><CheckCircle2 className="h-5 w-5" /> Completed</span>
            ) : (
              <button onClick={handleComplete} disabled={completing} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-emerald-600 disabled:opacity-70"><CheckCircle2 className="h-5 w-5" /> {completing ? "Completing..." : "Complete Workout"}</button>
            )}
          </div>

          <div className="mt-7 grid grid-cols-1 gap-6 xl:grid-cols-3">
            {Object.entries(weeklyExercises).map(([day, exercises]) => (
              <section key={day} className="rounded-2xl bg-gray-50 p-5">
                <div className="flex items-center gap-2"><Timer className="h-4 w-4 text-purple-600" /><h3 className="font-semibold text-gray-900">Day {day}</h3></div>
                <div className="mt-4 space-y-3">{exercises.map((exercise) => <ExerciseCard key={`${exercise.day_number}-${exercise.exercise_id}`} exercise={exercise} />)}</div>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
